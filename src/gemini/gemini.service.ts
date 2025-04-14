import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ContentPage } from 'src/contentpage/contentpage.entity';

@Injectable()
export class GeminiService {
  private genAI: GoogleGenerativeAI;

  constructor(
    @InjectRepository(ContentPage)
    private contentPageRepository: Repository<ContentPage>,
  ) {
    const apiKey = process.env.GEMINI_API_KEY;
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async enhanceDescription(description: string): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Lấy prompt từ ContentPage (giả sử id = 1, bạn có thể điều chỉnh logic)
    const contentPage = await this.contentPageRepository.findOne({
      where: { id: 1 },
    });
    const defaultPrompt = `create lesson content in detail for this english lesson, its topic and requirements as follow:${description}. Return result without bold or italic`;
    const prompt = contentPage?.promptDescription || defaultPrompt;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  async enhanceLessonPlan(
    lessonPlan: string,
    imageUrls: string[],
  ): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Ghép danh sách URL ảnh
    const imagesReference = imageUrls
      .map((url, index) => `Image ${index + 1}: ${url}`)
      .join('\n');

    // Lấy prompt từ ContentPage
    const contentPage = await this.contentPageRepository.findOne({
      where: { id: 1 },
    });
    const defaultPrompt = `Create a lesson plan for an English lesson with the following requirements: ${lessonPlan}. Use the following images as references:\n${imagesReference}. Return the result without bold or italic.`;
    const prompt = contentPage?.promptLessonPlan || defaultPrompt;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }
}
