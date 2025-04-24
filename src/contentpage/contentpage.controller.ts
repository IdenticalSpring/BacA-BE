import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { ContentPageService } from './contentpage.service';
import { CreateContentPageDto, UpdateContentPageDto } from './contentpage.dto';
import { ContentPage } from './contentpage.entity';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('contentpage')
export class ContentPageController {
  constructor(private readonly contentPageService: ContentPageService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files')) // Nhận nhiều file với key 'files'
  async create(
    @Body() createContentPageDto: CreateContentPageDto,
    @UploadedFiles() files: Express.Multer.File[], // Nhận files từ request
  ): Promise<ContentPage> {
    return this.contentPageService.create(createContentPageDto, files);
  }

  @Get()
  async findAll(): Promise<ContentPage[]> {
    return this.contentPageService.findAll();
  }
  @Get('adsenseId')
  async getAdsenseId(): Promise<string> {
    return this.contentPageService.getAdsenseId();
  }
  @Get('lessonPlanPlaceholder')
  async getPlaceHolderLessonPlan(): Promise<string> {
    return this.contentPageService.getPlaceHolderLessonPlan();
  }
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<ContentPage> {
    return this.contentPageService.findOne(id);
  }

  @Put(':id')
  @UseInterceptors(FilesInterceptor('files'))
  async update(
    @Param('id') id: number,
    @Body() updateContentPageDto: UpdateContentPageDto,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<ContentPage> {
    return this.contentPageService.update(id, updateContentPageDto, files);
  }

  @Put(':id/testimonial-images')
  @UseInterceptors(FilesInterceptor('files'))
  async updateTestimonialImages(
    @Param('id') id: number,
    @Body() updateContentPageDto: UpdateContentPageDto,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<ContentPage> {
    return this.contentPageService.updateTestimonialImages(
      id,
      updateContentPageDto,
      files,
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.contentPageService.remove(id);
  }
}
