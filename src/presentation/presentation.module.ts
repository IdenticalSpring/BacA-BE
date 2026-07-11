import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { DeepSeekService } from 'src/common/deepseek.service';
import { PresentationAsset } from './presentation-asset.entity';
import { PresentationShare } from './presentation-share.entity';
import { PresentationTag } from './presentation-tag.entity';
import { PresentationController } from './presentation.controller';
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
    ]),
    AuthModule,
    CloudinaryModule,
  ],
  controllers: [PresentationController],
  providers: [PresentationService, DeepSeekService],
  exports: [TypeOrmModule, PresentationService],
})
export class PresentationModule {}