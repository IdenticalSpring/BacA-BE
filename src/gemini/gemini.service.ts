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
    const prompt = `Enhance this description and make it more detailed and engaging. 
    Return the result without any bold, italic :\n\n${description}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }
}
