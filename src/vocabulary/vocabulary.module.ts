import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomeWork } from 'src/homeWork/homeWork.entity';
import { Vocabulary } from './vocabulary.entity';
import { HomeWorkModule } from 'src/homeWork/homeWork.module';
import { VocabularyService } from './vocabulary.service';
import { VocabularyController } from './vocabulary.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vocabulary, HomeWork]),
    forwardRef(() => HomeWorkModule),
  ],
  providers: [VocabularyService],
  controllers: [VocabularyController],
  exports: [TypeOrmModule, VocabularyService],
})
export class VocabularyModule {}
