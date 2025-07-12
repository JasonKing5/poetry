import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Dynasty } from '@prisma/client';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class EmbeddingService {
  constructor(private readonly prisma: PrismaService, private readonly http: HttpService) {}

  async embedPoems(poems: {id: number, title: string, author: {name: string} | null, dynasty: Dynasty, content: string[]}[]) {
    const texts = poems.map(p => `${p.title ?? ''}${p.author?.name ?? ''}${p.dynasty ?? ''}${p.content.join('')}`);

    const res  = await this.http.post('http://localhost:4001/embed-batch', { texts }).toPromise();
    const embeddings = res?.data || [];
    console.log('embeddings: ', embeddings.length, embeddings?.[0]?.length);

    return embeddings;
  }
}
