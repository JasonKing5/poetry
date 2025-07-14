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

export interface ChatRequest {
  id: string;
  message: {
    role: string;
    parts: [
      {
        type: string;
        text: string;
      }
    ];
    id: string;
  };
}

export interface ChatResponse {
  id: string;
  message: {
    role: string;
    parts: [
      {
        type: string;
        text: string;
      }
    ];
    id: string;
  };
}
