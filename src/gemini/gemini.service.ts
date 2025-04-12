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
    const prompt = `create description for english lesson with following ${description}. Return result without bold or italic`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }
  async enhanceLessonPlan(lessonPlan: string): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `create lessonPlan for english lesson with following${lessonPlan} Return result without bold or italic`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }
}
