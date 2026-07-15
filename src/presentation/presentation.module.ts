import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { DeepSeekService } from 'src/common/deepseek.service';
import { Lesson } from 'src/lesson/lesson.entity';
import { PresentationAsset } from './presentation-asset.entity';
import { PresentationShare } from './presentation-share.entity';
import { PresentationTag } from './presentation-tag.entity';
import { PresentationController } from './presentation.controller';
import { PresentationImageStorageService } from './presentation-image-storage.service';
import { PresentationMediaStorageService } from './presentation-media-storage.service';
import { Presentation } from './presentation.entity';
import { PresentationService } from './presentation.service';
import { PptTag } from './ppt-tag.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Presentation,
      PresentationAsset,
      PresentationShare,
      PptTag,
      PresentationTag,
      Lesson,
    ]),
    AuthModule,
  ],
  controllers: [PresentationController],
  providers: [
    PresentationService,
    PresentationImageStorageService,
    PresentationMediaStorageService,
    DeepSeekService,
  ],
  exports: [TypeOrmModule, PresentationService],
})
export class PresentationModule {}
