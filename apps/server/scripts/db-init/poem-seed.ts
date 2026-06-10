/**
 * Prisma Enum (dynasty)	对应的 CSV 文件列表	备注
 * xianQin	先秦.csv	
 * qinHan	秦.csv, 汉.csv	秦代诗歌极少，主要在汉
 * weiJinNanBeiChao	魏晋.csv, 南北朝.csv, 魏晋末南北朝初.csv	
 * sui	隋.csv	
 * tang	唐.csv, 隋末唐初.csv	
 * song	宋_1.csv 至 宋_4.csv, 唐末宋初.csv, 宋末金初.csv, 辽.csv, 金.csv	五代词归入宋词源流，辽金并入宋代时间轴
 * yuan	元.csv, 宋末元初.csv, 金末元初.csv	
 * ming	明_1.csv 至 明_4.csv, 元末明初.csv	
 * qing	清_1.csv, 清_2.csv, 明末清初.csv	明末清初一般归入清代或明代，此处归入清作为新朝代开始
 * modern	近现代.csv, 当代.csv, 清末民国初.csv, 清末近现代初.csv, 近现代末当代初.csv, 民国末当代初.csv	统称近现代
 */
import { PrismaClient, PoetryType, PoetrySource, PoetryStatus, Dynasty } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

const BASE_DIR = path.resolve(__dirname, '../../data');

const prisma = new PrismaClient();

// 1. 定义映射关系
const DYNASTY_FILES: Record<Dynasty, string[]> = {
  xianQin: ['先秦.csv'],
  qinHan: ['秦.csv', '汉.csv'],
  weiJinNanBeiChao: ['魏晋.csv', '南北朝.csv', '魏晋末南北朝初.csv'],
  sui: ['隋.csv'],
  tang: ['唐.csv', '隋末唐初.csv'],
  song: [
    '宋_1.csv', '宋_2.csv', '宋_3.csv', '宋_4.csv', 
    '唐末宋初.csv', '宋末金初.csv', '辽.csv', '金.csv'
  ],
  yuan: ['元.csv', '宋末元初.csv', '金末元初.csv'],
  ming: ['明_1.csv', '明_2.csv', '明_3.csv', '明_4.csv', '元末明初.csv'],
  qing: ['清_1.csv', '清_2.csv', '明末清初.csv'],
  modern: [
    '近现代.csv', '当代.csv', 
    '清末民国初.csv', '清末近现代初.csv', '民国末当代初.csv', '近现代末当代初.csv'
  ],
};

// 简单的体裁推断逻辑
function inferType(dynasty: Dynasty, content: string[]): PoetryType {
  if (dynasty === 'yuan') return PoetryType.qu;
  if (dynasty === 'song') {
    return PoetryType.ci
  }
  // 默认为唐诗/古诗
  return PoetryType.shi;
}

export async function poemSeed() {
  console.log('🚀 开始导入poem数据...');
  
  // CSV 所在的文件夹路径，请根据实际情况修改
  const DATA_DIR = path.resolve(BASE_DIR, 'poetry-data');
  console.log('DATA_DIR:', DATA_DIR);

  // 1. 获取或创建一个系统用户作为上传者
  const rootEmail = process.env.ROOT_EMAIL || 'root@example.com';
  let systemUser = await prisma.user.findFirst({ where: { email: rootEmail } });
  if (!systemUser) {
    // 如果没有用户，这里需要你的 User 表结构来创建一个占位用户
    // 假设 User 表有 email 或 username
    console.log(`⚠️ 未找到 ${rootEmail} 的用户，请先确保数据库存在root用户。`);
    return;
  }
  const submitterId = systemUser.id;

  // 2. 作者缓存 (Name -> ID)，减少数据库查询
  const authorCache = new Map<string, number>();
  const existingAuthors = await prisma.author.findMany({ select: { id: true, name: true } });
  existingAuthors.forEach(a => authorCache.set(a.name, a.id));

  // 3. 遍历朝代和文件
  for (const [dynastyKey, files] of Object.entries(DYNASTY_FILES)) {
    const dynasty = dynastyKey as Dynasty;
    
    for (const file of files) {
      const filePath = path.join(DATA_DIR, file);
      if (!fs.existsSync(filePath)) {
        console.warn(`⚠️ 文件不存在，跳过: ${file}`);
        continue;
      }

      console.log(`正在处理: ${file} -> ${dynasty}...`);
      
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      // 解析 CSV，headers 是: 题目,朝代,作者,内容
      const records: { title: string; rawDynasty: string; authorName: string; content: string }[] = parse(fileContent, {
        columns: ['title', 'rawDynasty', 'authorName', 'content'],
        skip_empty_lines: true,
        from_line: 2, // 如果第一行是表头，从第2行开始；如果没有表头，注释掉这一行
        relax_quotes: true // 防止某些古文里的引号导致解析错误
      }).slice(0, 2) as { title: string; rawDynasty: string; authorName: string; content: string }[]; // 只处理前2条

      for (const record of records) {
        let { title, authorName, content } = record;
        
        if (!title || !content) continue;

        // 清洗数据
        title = title.trim();
        authorName = authorName?.trim() || '无名氏';
        
        // 处理内容：将 CSV 中的长字符串转换为 String[]
        // 内容里按句号切割
        const contentArray = content.split('。').map((s: string) => s.trim()).filter((s: string) => s.length > 0);

        // --- 处理作者 ---
        let authorId = authorCache.get(authorName);
        if (!authorId) {
          try {
            const newAuthor = await prisma.author.upsert({
              where: { name: authorName },
              update: {},
              create: {
                name: authorName,
                dynasty: dynasty, // 记录作者的主要朝代
                submitterId,
                status: PoetryStatus.approved
              }
            });
            authorId = newAuthor.id;
            authorCache.set(authorName, authorId);
          } catch (e) {
            console.error(`Error creating author ${authorName}:`, e);
            continue; 
          }
        }

        // --- 处理诗词 ---
        try {
          await prisma.poem.create({
            data: {
              title,
              content: contentArray,
              type: inferType(dynasty, contentArray),
              source: PoetrySource.ancientPoem,
              dynasty: dynasty,
              submitterId,
              authorId,
              status: PoetryStatus.approved,
            }
          });
        } catch (e) {
          console.error(`Failed to import poem: ${title}`, e);
        }
      }
    }
  }

  console.log('✅ 所有poem数据导入完成！');
}
