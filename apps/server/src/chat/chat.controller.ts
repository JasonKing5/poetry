import { Body, Controller, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // bodyMock: any = {
  //   "id": "fd7aa48b-2c43-4699-bcd0-d767832084b2",
  //   "message": {
  //     "role": "user",
  //     "parts": [
  //       {
  //         "type": "text",
  //         "text": "What are the advantages of using Next.js?"
  //       }
  //     ],
  //     "id": "f65f374f-c433-4827-a016-fe95b0b9520d"
  //   },
  //   "selectedChatModel": "chat-model",
  //   "selectedVisibilityType": "private"
  // }

  @Post('/')
  @Public()
  async chat(@Body() body: { 
    message: {
      parts: [
        {
          type: string,
          text: string
        }
      ]
    },
  }) {
    const { 
      message,
    } = body;
    const input = message.parts[0].text;
    console.log('input: ', input);

    return await this.chatService.chat(input);
  }
}
