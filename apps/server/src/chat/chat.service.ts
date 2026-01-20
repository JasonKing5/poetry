import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmbeddingService } from '../embedding/embedding.service';

@Injectable()
export class ChatService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly embeddingService: EmbeddingService
  ) {}

  async chat(input: string) {
    const inputVector = await this.embeddingService.embed(input);

    if (!inputVector.length) {
      throw new Error('Failed to generate embedding for the input text');
    }

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
      LIMIT 3
    `;

    return poems;
  }
}
