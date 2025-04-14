import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async enhanceDescription(description: string): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `create lesson content in detail for this english lesson, its topic and requirements as follow:${description}. Return result without bold or italic`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }
  async enhanceLessonPlan(
    lessonPlan: string,
    imageUrls: string[],
  ): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Ghép danh sách URL ảnh thành một chuỗi
    const imagesReference = imageUrls
      .map((url, index) => `Image ${index + 1}: ${url}`)
      .join('\n');

    const prompt = `Create a lesson plan for an English lesson with the following requirements: ${lessonPlan}. Use the following images as references:\n${imagesReference}. Return the result without bold or italic.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }
}
