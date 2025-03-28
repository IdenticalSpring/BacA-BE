import { Controller, Post, Body } from '@nestjs/common';
import { GeminiService } from './gemini.service';

@Controller('chatbot')
export class GeminiController {
  constructor(private readonly chatbotService: GeminiService) {}

  @Post('enhance')
  async enhanceDescription(
    @Body('description') description: string,
  ): Promise<{ response: string }> {
    const response = await this.chatbotService.enhanceDescription(description);
    return { response };
  }
}
