import { Controller, Post, Body, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { EmbeddingService } from './embedding.service';
import { EmbedRequestDto } from './dto/embed-request.dto';
import { EmbedResponseDto } from './dto/embed-response.dto';
import { BatchEmbedRequestDto } from './dto/batch-embed-request.dto';
import { BatchEmbedResponseDto } from './dto/batch-embed-response.dto';
import { Public } from '../common/decorators/public.decorator';

@Controller()
export class EmbeddingController {
  constructor(private readonly embeddingService: EmbeddingService) {}

  @Post('embed')
  @Public()
  @HttpCode(HttpStatus.OK)
  async embed(@Body() embedRequest: EmbedRequestDto): Promise<EmbedResponseDto> {
    const embedding = await this.embeddingService.embed(embedRequest.text);
    return { embedding };
  }

  @Post('embed-batch')
  @Public()
  @HttpCode(HttpStatus.OK)
  async embedBatch(@Body() batchRequest: BatchEmbedRequestDto): Promise<BatchEmbedResponseDto> {
    const embeddings = await this.embeddingService.embedBatch(batchRequest.texts);
    return { embeddings };
  }

  @Get('healthz')
  @Public()
  @HttpCode(HttpStatus.OK)
  async healthCheck(): Promise<{ status: string }> {
    return await this.embeddingService.healthCheck();
  }
}