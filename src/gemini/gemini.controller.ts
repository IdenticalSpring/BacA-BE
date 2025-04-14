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
  @Post('enhance-lesson-plan')
  async enhanceLessonPlan(
    @Body('lessonPlan') lessonPlan: string,
    @Body('imageUrls') imageUrls: string[], // Nhận imageUrls từ body
  ): Promise<{ response: string }> {
    // Gọi GeminiService với lessonPlan và imageUrls
    const response = await this.chatbotService.enhanceLessonPlan(
      lessonPlan,
      imageUrls || [], // Đảm bảo imageUrls là mảng, mặc định rỗng nếu không có
    );
    return { response };
  }
}
