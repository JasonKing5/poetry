import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Dynasty, PoetrySource, PoetryStatus, PoetryType } from '@prisma/client';
import { EmbeddingService } from '../embedding/embedding.service';
import { PoetryPropService } from '../poetry-prop/poetry-prop.service';

@Injectable()
export class PoetryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly embeddingService: EmbeddingService,
    private readonly poetryPropService: PoetryPropService
  ) {}

  private SELECT_POETRY_BASE = {
    id: true,
    title: true,
    author: {
      select: {
        id: true,
        name: true,
      },
    },
    type: true,
    source: true,
    status: true,
    dynasty: true,
    order: true,
    content: true,
    submitter: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
    likes: true,
    createdAt: true,
    updatedAt: true,
  };

  private SELECT_POETRY_FULL = {
    ...this.SELECT_POETRY_BASE,
  };

  /**
   * 分页查询诗词
   * @param title 标题
   * @param author 作者
   * @param type 类型
   * @param status 状态
   * @param submitter 提交人
   * @param dynasty 朝代
   * @param page 当前页码（从1开始）
   * @param pageSize 每页条数
   */
  async findAll(
    title?: string, 
    type?: PoetryType, 
    source?: string, 
    dynasty?: Dynasty, 
    submitter?: number, 
    author?: string, 
    status?: PoetryStatus, 
    page: number = 1, 
    pageSize: number = 20,
    currentUserId?: number
  ) {
    const where: any = {};
    if (type) where.type = type;
    if (title) where.title = { contains: title };
    if (status) where.status = status;
    if (source) where.status = source;
    if (submitter) where.submitterId = submitter;
    if (dynasty) where.dynasty = dynasty;
    if (author) where.authorId = parseInt(author);
    // 校正分页参数
    const take = Math.max(1, Math.min(pageSize, 100));
    const skip = Math.max(0, (page - 1) * take);
    const [total, list] = await Promise.all([
      this.prisma.poem.count({ where }),
      this.prisma.poem.findMany({
        where,
        take,
        skip,
        orderBy: [
          { order: 'asc' },
          { id: 'asc' },
        ],
        select: this.SELECT_POETRY_BASE,
      }),
    ]);

    const isLiked = (likes: any) => likes.some((like: any) => like.userId === currentUserId);

    // Format response
    const formattedList = list.map(poetry => ({
      ...poetry,
      likes: {
        count: poetry.likes.length || 0,
        isLiked: isLiked(poetry.likes),
      }
    }));

    return {
      total,
      list: formattedList,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }

  async search(input: string, limit: number = 10) {
    const inputVector = await this.embeddingService.embed(input);

    if (!inputVector.length) {
      throw new Error('Failed to generate embedding for the input text');
    }

    console.log('search service inputVector: ', inputVector.length);
    console.log('search service limit: ', limit, typeof limit);

    // Convert the input vector to a PostgreSQL array string
    const pgVector = `[${inputVector.join(',')}]`;

    const poems = await this.prisma.$queryRaw`
      SELECT
        p.id,
        p.title,
        a.name as author,
        p.dynasty,
        p.content,
        p.embedding <=> ${pgVector}::vector as distance
      FROM "Poem" p
      LEFT JOIN "Author" a ON p."authorId" = a.id
      WHERE p.embedding IS NOT NULL
      ORDER BY distance
      LIMIT ${limit}
    `;

    console.log('search service poems: ', poems);

    return poems;
  }

  async findPoems(poemIds: number[]) {
    return await this.prisma.poem.findMany({
      where: { id: { in: poemIds } },
      select: this.SELECT_POETRY_BASE,
    });
  }

  async findOne(id: number) {
    return await this.prisma.poem.findUnique({
      where: { id },
      select: this.SELECT_POETRY_FULL,
    });
  }

  async create(title: string, authorId: number, type: PoetryType, tags: string[], source: PoetrySource, status: PoetryStatus, dynasty: Dynasty, submitterId: number) {
    return await this.prisma.poem.create({
      data: {
        title,
        authorId,
        type,
        source,
        status,
        dynasty,
        submitterId,
      },
    });
  }

  async update(id: number, title: string, authorId: number, tags: string[]) {
    return await this.prisma.poem.update({
      where: { id },
      data: {
        title,
        authorId,
      },
    });
  }

  async delete(id: number) {
    return await this.prisma.poem.delete({
      where: { id },
    });
  }

  async moveUp(id: number) {
    const current = await this.prisma.poem.findUnique({ where: { id } });
    if (!current) throw new Error('Poem not found');

    const previous = await this.prisma.poem.findFirst({
      where: {
        order: { lt: current.order },
        isDeleted: false,
      },
      orderBy: { order: 'desc' },
    });

    if (!previous) return current;

    await this.prisma.$transaction([
      this.prisma.poem.update({
        where: { id: current.id },
        data: { order: previous.order },
      }),
      this.prisma.poem.update({
        where: { id: previous.id },
        data: { order: current.order },
      }),
    ]);

    return await this.prisma.poem.findUnique({ where: { id } });
  }

  async moveDown(id: number) {
    const current = await this.prisma.poem.findUnique({ where: { id } });
    if (!current) throw new Error('Poem not found');

    const next = await this.prisma.poem.findFirst({
      where: {
        order: { gt: current.order },
        isDeleted: false,
      },
      orderBy: { order: 'asc' },
    });

    if (!next) return current;

    await this.prisma.$transaction([
      this.prisma.poem.update({
        where: { id: current.id },
        data: { order: next.order },
      }),
      this.prisma.poem.update({
        where: { id: next.id },
        data: { order: current.order },
      }),
    ]);

    return await this.prisma.poem.findUnique({ where: { id } });
  }

  async moveToTop(id: number) {
    const current = await this.prisma.poem.findUnique({ where: { id } });
    if (!current) throw new Error('Poem not found');

    const minPoem = await this.prisma.poem.findFirst({
      where: { isDeleted: false },
      orderBy: { order: 'asc' },
    });

    if (!minPoem || minPoem.id === current.id) return current;

    if (current.order > minPoem.order) {
      await this.prisma.poem.updateMany({
        where: {
          order: { lt: current.order },
          isDeleted: false,
        },
        data: { order: { increment: 1 } },
      });

      await this.prisma.poem.update({
        where: { id },
        data: { order: minPoem.order },
      });
    }

    return await this.prisma.poem.findUnique({ where: { id } });
  }

  async moveToBottom(id: number) {
    const current = await this.prisma.poem.findUnique({ where: { id } });
    if (!current) throw new Error('Poem not found');

    const maxPoem = await this.prisma.poem.findFirst({
      where: { isDeleted: false },
      orderBy: { order: 'desc' },
    });

    if (!maxPoem || maxPoem.id === current.id) return current;

    if (current.order < maxPoem.order) {
      await this.prisma.poem.updateMany({
        where: {
          order: { gt: current.order },
          isDeleted: false,
        },
        data: { order: { decrement: 1 } },
      });

      await this.prisma.poem.update({
        where: { id },
        data: { order: maxPoem.order },
      });
    }

    return await this.prisma.poem.findUnique({ where: { id } });
  }

  // 日历诗句查询
  async getCalendarPoem() {
    // 获取农历数据
    const lunarInfo = await this.poetryPropService.findLunar();

    // 构建查询文本
    const searchQuery = this.buildCalendarSearchQuery(lunarInfo);

    // 搜索诗句
    const searchResults = await this.search(searchQuery, 1);

    // 处理搜索结果：确保是数组
    let poemsArray: any[] = [];
    if (Array.isArray(searchResults)) {
      poemsArray = searchResults;
    } else if (searchResults && typeof searchResults === 'object') {
      // 如果是对象，尝试提取数组数据
      if ('data' in searchResults && Array.isArray(searchResults.data)) {
        poemsArray = searchResults.data;
      } else if ('list' in searchResults && Array.isArray(searchResults.list)) {
        poemsArray = searchResults.list;
      }
    }

    // 如果没有搜索结果，返回默认诗句
    if (poemsArray.length === 0) {
      return this.getDefaultPoem();
    }

    // 格式化结果
    const poem = poemsArray[0];
    return {
      poem: this.formatPoemResult(poem),
      searchQuery,
      hasDynamicResult: true
    };
  }

  // 查询文本构建函数
  private buildCalendarSearchQuery(lunarInfo: any): string {
    const keywords: string[] = [];

    // 1. 节气优先
    if (lunarInfo.jieqi) {
      keywords.push(lunarInfo.jieqi);
      // 节气相关词汇扩展
      const jieqiExtensions: Record<string, string> = {
        // 春季
        '立春': '春天 春回大地 万物复苏 春节 新春',
        '雨水': '雨水 春雨 润物细无声 春天',
        '惊蛰': '惊蛰 春雷 万物复苏 昆虫',
        '春分': '春分 昼夜平分 春天 平衡',
        '清明': '清明 扫墓 踏青 春天 思念 祭祖',
        '谷雨': '谷雨 春雨 播种 春天',
        // 夏季
        '立夏': '立夏 夏天 炎热 夏季',
        '小满': '小满 麦子 丰收 夏季',
        '芒种': '芒种 忙碌 播种 夏季',
        '夏至': '夏至 最长白天 夏天 炎热',
        '小暑': '小暑 炎热 夏天 暑气',
        '大暑': '大暑 最热 夏天 炎热',
        // 秋季
        '立秋': '立秋 秋天 凉爽 秋季',
        '处暑': '处暑 炎热结束 秋天 凉爽',
        '白露': '白露 露水 秋天 凉爽',
        '秋分': '秋分 昼夜平分 秋天 收获',
        '寒露': '寒露 寒冷 露水 秋天',
        '霜降': '霜降 霜冻 寒冷 秋天',
        // 冬季
        '立冬': '立冬 冬天 寒冷 冬季',
        '小雪': '小雪 雪花 冬天 寒冷',
        '大雪': '大雪 雪花 冬天 严寒',
        '冬至': '冬至 最短白天 冬天 寒冷 饺子',
        '小寒': '小寒 寒冷 冬天 严寒',
        '大寒': '大寒 最冷 冬天 严寒',
      };
      const extension = jieqiExtensions[lunarInfo.jieqi];
      if (extension) {
        keywords.push(...extension.split(' '));
      }
    }

    // 2. 节日
    if (lunarInfo.festival) {
      keywords.push(lunarInfo.festival);
      // 节日相关词汇扩展
      const festivalExtensions: Record<string, string> = {
        '春节': '新年 除夕 团圆 过年 红包',
        '元宵节': '元宵 汤圆 灯会 上元节',
        '清明节': '清明 扫墓 踏青 祭祖',
        '端午节': '端午 粽子 龙舟 屈原',
        '中秋节': '中秋 月亮 团圆 月饼 赏月',
        '重阳节': '重阳 登高 敬老 菊花',
        '国庆节': '国庆 祖国 庆祝 节日',
        '元旦': '新年 元旦 跨年',
      };
      const extension = festivalExtensions[lunarInfo.festival];
      if (extension) {
        keywords.push(...extension.split(' '));
      }
    }

    if (lunarInfo.lunar_festival) {
      keywords.push(lunarInfo.lunar_festival);
      // 农历节日扩展
      const lunarFestivalExtensions: Record<string, string> = {
        '春节': '新年 除夕 团圆 过年 红包',
        '元宵节': '元宵 汤圆 灯会 上元节',
        '端午节': '端午 粽子 龙舟 屈原',
        '七夕节': '七夕 牛郎织女 爱情 乞巧',
        '中元节': '中元 鬼节 祭祖',
        '中秋节': '中秋 月亮 团圆 月饼 赏月',
        '重阳节': '重阳 登高 敬老 菊花',
        '腊八节': '腊八 粥 冬天',
      };
      const festivalExtension = lunarFestivalExtensions[lunarInfo.lunar_festival];
      if (festivalExtension) {
        keywords.push(...festivalExtension.split(' '));
      }
    }

    // 3. 农历日期
    if (lunarInfo.lubarmonth && lunarInfo.lunarday) {
      const lunarDate = `${lunarInfo.lubarmonth}${lunarInfo.lunarday}`;
      keywords.push(lunarDate);
      // 特殊日期处理
      if (lunarDate === '正月初一') keywords.push('春节 新年 初一 除夕');
      if (lunarDate === '正月十五') keywords.push('元宵 上元节 灯会 汤圆');
      if (lunarDate === '五月初五') keywords.push('端午 粽子 龙舟 屈原');
      if (lunarDate === '七月初七') keywords.push('七夕 牛郎织女 爱情');
      if (lunarDate === '八月十五') keywords.push('中秋 月亮 团圆 月饼');
      if (lunarDate === '九月初九') keywords.push('重阳 登高 敬老 菊花');
    }

    // 4. 生肖
    if (lunarInfo.shengxiao) {
      keywords.push(`${lunarInfo.shengxiao}年`);
      keywords.push(lunarInfo.shengxiao);
    }

    // 5. 添加通用诗词词汇
    keywords.push('诗词 诗句 古诗 诗歌 文学');

    // 去重并连接
    return [...new Set(keywords.filter(Boolean))].join(' ');
  }

  // 默认诗句（当前苏轼诗句）
  private getDefaultPoem() {
    return {
      poem: {
        id: 0,
        content: "雪沫乳花浮午盏，蓼茸蒿笋试春盘。人间有味是清欢。",
        author: "苏轼",
        title: "浣溪沙·细雨斜风作晓寒",
        dynasty: "宋",
        distance: 0
      },
      searchQuery: '',
      hasDynamicResult: false
    };
  }

  // 格式化诗句结果
  private formatPoemResult(poem: any) {
    return {
      id: poem.id || 0,
      title: poem.title || '',
      author: poem.author || '',
      dynasty: poem.dynasty || '',
      content: poem.content || '',
      distance: poem.distance || 0
    };
  }
}
