import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeminiController } from './gemini.controller';
import { GeminiService } from './gemini.service';
import { ContentPage } from 'src/contentpage/contentpage.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ContentPage])],
  providers: [GeminiService],
  controllers: [GeminiController],
})
export class GeminiModule {}
