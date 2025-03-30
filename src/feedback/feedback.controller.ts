import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto, UpdateFeedbackDto } from './feedback.dto';
import { Feedback } from './feedback.entity';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  async create(
    @Body() createFeedbackDto: CreateFeedbackDto,
  ): Promise<Feedback> {
    return this.feedbackService.create(createFeedbackDto);
  }

  @Get()
  async findAll(): Promise<Feedback[]> {
    return this.feedbackService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Feedback> {
    return this.feedbackService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateFeedbackDto: UpdateFeedbackDto,
  ): Promise<Feedback> {
    return this.feedbackService.update(id, updateFeedbackDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.feedbackService.remove(id);
  }
}
