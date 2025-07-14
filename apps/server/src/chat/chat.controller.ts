import { Body, Controller, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Public } from 'src/common/decorators/public.decorator';
// import { ChatRequest } from '@repo/types';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('/')
  @Public()
  async chat(@Body() body: { input: string }) {
    const {
      input,
    } = body;
    console.log('input: ', input);

    // const result = await this.chatService.chat(input);
    return await this.chatService.chat(input);
    // return {
    //   id,
    //   message: {
    //     role: 'assistant',
    //     parts: [
    //       {
    //         type: 'text',
    //         text: result
    //       }
    //     ],
    //     id: message.id
    //   }
    // };
  }
}
