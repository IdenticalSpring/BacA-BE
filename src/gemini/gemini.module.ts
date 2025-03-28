import { Module } from '@nestjs/common';
import { GeminiController } from './gemini.controller';
import { GeminiService } from './gemini.service';

@Module({
  providers: [GeminiService],
  controllers: [GeminiController],
})
export class GeminiModule {}
