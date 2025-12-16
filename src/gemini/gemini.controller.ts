import { Controller, Post, Body, ParseIntPipe } from '@nestjs/common';
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
    @Body('imageUrls') imageUrls: string[],
  ): Promise<{ response: string }> {
    try {
      console.log('📥 [Controller] Received enhance-lesson-plan request');
      console.log('📝 Lesson plan length:', lessonPlan?.length || 0);
      console.log('🖼️ Images count:', imageUrls?.length || 0);

      if (!lessonPlan || lessonPlan.trim().length === 0) {
        throw new Error('Lesson plan content is required');
      }

      const response = await this.chatbotService.enhanceLessonPlan(
        lessonPlan,
        imageUrls || [],
      );
      
      console.log('✅ [Controller] Response sent successfully');
      return { response };
    } catch (error) {
      console.error('❌ [Controller] Error in enhance-lesson-plan:', error.message);
      throw error;
    }
  }
  @Post('analyze')
  async analyzeWithImage(
    @Body('question') question: string | null,
    @Body('imageUrl') imageUrl: string | null,
  ): Promise<{ response: string }> {
    const safeQuestion = question || '';
    const safeImageUrl = imageUrl || '';
    const response = await this.chatbotService.analyzeWithImage(
      safeQuestion,
      safeImageUrl,
    );
    return { response };
  }

  @Post('student-answer')
  async handleStudentAnswer(
    @Body('classId', ParseIntPipe) classId: number,
    @Body('studentId', ParseIntPipe) studentId: number,
    @Body('teacherId', ParseIntPipe) teacherId: number,
    @Body('audioUrl') audioUrl: string,
    @Body('answer') answer: string,
  ): Promise<{ aiReply: string }> {
    const aiReply = await this.chatbotService.replyToStudentAnswer({
      classId,
      studentId,
      teacherId,
      audioUrl,
      answer,
    });
    return { aiReply };
  }
}
