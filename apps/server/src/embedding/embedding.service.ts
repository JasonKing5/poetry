import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { EmbedRequestDto } from './dto/embed-request.dto';
import { EmbedResponseDto } from './dto/embed-response.dto';
import { BatchEmbedRequestDto } from './dto/batch-embed-request.dto';
import { BatchEmbedResponseDto } from './dto/batch-embed-response.dto';

@Injectable()
export class EmbeddingService {
  private readonly embeddingServerUrl: string;
  private readonly isSiliconFlow: boolean;
  private readonly apiKey?: string;

  constructor() {
    const url = process.env.SILICONFLOW_API_URL;
    console.log(`EmbeddingService constructor: SILICONFLOW_API_URL=${url}`);
    if (!url) {
      throw new Error('SILICONFLOW_API_URL environment variable is not set');
    }
    this.embeddingServerUrl = url;
    this.isSiliconFlow = url.includes('siliconflow');
    console.log(`EmbeddingService constructor: isSiliconFlow=${this.isSiliconFlow}`);

    if (this.isSiliconFlow) {
      const apiKey = process.env.SILICONFLOW_API_KEY;
      console.log(`EmbeddingService constructor: SILICONFLOW_API_KEY present=${!!apiKey}`);
      if (!apiKey) {
        throw new Error('SILICONFLOW_API_KEY environment variable is not set');
      }
      this.apiKey = apiKey;
    }
  }

  /**
   * 对单个文本生成嵌入向量
   */
  async embed(text: string): Promise<number[]> {
    console.log(`EmbeddingService.embed called, isSiliconFlow: ${this.isSiliconFlow}, url: ${this.embeddingServerUrl}`);
    if (this.isSiliconFlow) {
      console.log('Using SiliconFlow API');
      return this.embedWithSiliconFlow(text);
    } else {
      console.log('Using generic embedding service');
      return this.embedGeneric(text);
    }
  }

  private async embedGeneric(text: string): Promise<number[]> {
    try {
      const response = await axios.post<EmbedResponseDto>(
        `${this.embeddingServerUrl}/embed`,
        { text },
        {
          timeout: 30000, // 30秒超时
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.data || !Array.isArray(response.data.embedding)) {
        throw new Error('Invalid response format from embedding service');
      }

      return response.data.embedding;
    } catch (error: any) {
      if (error.response) {
        // 请求已发送，服务器响应状态码超出2xx范围
        throw new HttpException(
          `Embedding service error: ${error.response.status} - ${JSON.stringify(error.response.data)}`,
          error.response.status
        );
      } else if (error.request) {
        // 请求已发送但未收到响应
        throw new HttpException(
          'Cannot connect to embedding service',
          HttpStatus.SERVICE_UNAVAILABLE
        );
      } else {
        // 设置请求时发生错误
        throw new HttpException(
          `Embedding request configuration error: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }

  private async embedWithSiliconFlow(text: string): Promise<number[]> {
    console.log(`embedWithSiliconFlow called, url: ${this.embeddingServerUrl}/embeddings, text length: ${text.length}`);
    try {
      const url = `${this.embeddingServerUrl}/embeddings`;
      console.log(`Making request to: ${url}`);
      const response = await axios.post(
        url,
        {
          model: 'BAAI/bge-large-zh-v1.5',
          input: [text],
          encoding_format: 'float'
        },
        {
          timeout: 30000,
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.data || !Array.isArray(response.data.data)) {
        throw new Error('Invalid response format from SiliconFlow API');
      }

      const embedding = response.data.data[0]?.embedding;
      if (!Array.isArray(embedding)) {
        throw new Error('Invalid embedding format from SiliconFlow API');
      }

      return embedding;
    } catch (error: any) {
      console.log(`SiliconFlow API error caught: ${error.message}`);
      console.log(`error.response: ${!!error.response}, error.request: ${!!error.request}`);
      if (error.response) {
        console.log(`Response status: ${error.response.status}, data: ${JSON.stringify(error.response.data)}`);
        throw new HttpException(
          `SiliconFlow API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`,
          error.response.status
        );
      } else if (error.request) {
        console.log('No response received from SiliconFlow API');
        throw new HttpException(
          'Cannot connect to SiliconFlow API',
          HttpStatus.SERVICE_UNAVAILABLE
        );
      } else {
        console.log(`Request configuration error: ${error.message}`);
        throw new HttpException(
          `SiliconFlow API request configuration error: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }

  /**
   * 对批量文本生成嵌入向量
   */
  async embedBatch(texts: string[]): Promise<number[][]> {
    if (this.isSiliconFlow) {
      return this.embedBatchWithSiliconFlow(texts);
    } else {
      return this.embedBatchGeneric(texts);
    }
  }

  private async embedBatchGeneric(texts: string[]): Promise<number[][]> {
    try {
      const response = await axios.post<BatchEmbedResponseDto>(
        `${this.embeddingServerUrl}/embed-batch`,
        { texts },
        {
          timeout: 60000, // 60秒超时，批量处理可能需要更长时间
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.data || !Array.isArray(response.data.embeddings)) {
        throw new Error('Invalid response format from embedding service');
      }

      return response.data.embeddings;
    } catch (error: any) {
      if (error.response) {
        // 请求已发送，服务器响应状态码超出2xx范围
        throw new HttpException(
          `Embedding service error: ${error.response.status} - ${JSON.stringify(error.response.data)}`,
          error.response.status
        );
      } else if (error.request) {
        // 请求已发送但未收到响应
        throw new HttpException(
          'Cannot connect to embedding service',
          HttpStatus.SERVICE_UNAVAILABLE
        );
      } else {
        // 设置请求时发生错误
        throw new HttpException(
          `Embedding request configuration error: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }

  private async embedBatchWithSiliconFlow(texts: string[]): Promise<number[][]> {
    try {
      const response = await axios.post(
        `${this.embeddingServerUrl}/embeddings`,
        {
          model: 'BAAI/bge-large-zh-v1.5',
          input: texts,
          encoding_format: 'float'
        },
        {
          timeout: 60000,
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.data || !Array.isArray(response.data.data)) {
        throw new Error('Invalid response format from SiliconFlow API');
      }

      const embeddings = response.data.data.map((item: any) => {
        if (!item.embedding || !Array.isArray(item.embedding)) {
          throw new Error('Invalid embedding format from SiliconFlow API');
        }
        return item.embedding;
      });

      return embeddings;
    } catch (error: any) {
      console.log(`SiliconFlow API error caught: ${error.message}`);
      console.log(`error.response: ${!!error.response}, error.request: ${!!error.request}`);
      if (error.response) {
        console.log(`Response status: ${error.response.status}, data: ${JSON.stringify(error.response.data)}`);
        throw new HttpException(
          `SiliconFlow API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`,
          error.response.status
        );
      } else if (error.request) {
        console.log('No response received from SiliconFlow API');
        throw new HttpException(
          'Cannot connect to SiliconFlow API',
          HttpStatus.SERVICE_UNAVAILABLE
        );
      } else {
        console.log(`Request configuration error: ${error.message}`);
        throw new HttpException(
          `SiliconFlow API request configuration error: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<{ status: string }> {
    try {
      const response = await axios.get(`${this.embeddingServerUrl}/healthz`, {
        timeout: 5000,
      });
      return response.data;
    } catch (error: any) {
      throw new HttpException(
        'Embedding service is not available',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }
}