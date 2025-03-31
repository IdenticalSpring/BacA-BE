import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentPageService } from './contentpage.service';
import { ContentPageController } from './contentpage.controller';
import { ContentPage } from './contentpage.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ContentPage])],
  controllers: [ContentPageController],
  providers: [ContentPageService],
})
export class ContentPageModule {}
