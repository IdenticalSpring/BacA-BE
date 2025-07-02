import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { ContentPageService } from './contentpage.service';
import { CreateContentPageDto, UpdateContentPageDto } from './contentpage.dto';
import { ContentPage } from './contentpage.entity';

@Controller('contentpage')
export class ContentPageController {
  constructor(private readonly contentPageService: ContentPageService) {}

  @Post()
  async create(
    @Body() createContentPageDto: CreateContentPageDto,
  ): Promise<ContentPage> {
    return this.contentPageService.create(createContentPageDto);
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
  async update(
    @Param('id') id: number,
    @Body() updateContentPageDto: UpdateContentPageDto,
  ): Promise<ContentPage> {
    return this.contentPageService.update(id, updateContentPageDto);
  }

  @Put(':id/testimonial-images')
  async updateTestimonialImages(
    @Param('id') id: number,
    @Body() updateContentPageDto: UpdateContentPageDto,
  ): Promise<ContentPage> {
    return this.contentPageService.updateTestimonialImages(
      id,
      updateContentPageDto,
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.contentPageService.remove(id);
  }
}
