import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import {
  CreateScheduleDto,
  dayOfWeekScheduleDto,
  UpdateScheduleDto,
} from './schedule.dto';
import { Schedule } from './schedule.entity';

@Controller('schedules')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get()
  async findAll(): Promise<Schedule[]> {
    return await this.scheduleService.findAll();
  }
  @Post('/day-of-week')
  async findbyDayOfWeek(
    @Body() dayOfWeekScheduleDto: dayOfWeekScheduleDto,
  ): Promise<Schedule[]> {
    console.log('dayOfWeekScheduleDto', dayOfWeekScheduleDto);
    return await this.scheduleService.findByDayOfWeek(
      dayOfWeekScheduleDto.dayOfWeek,
    );
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Schedule> {
    return await this.scheduleService.findOne(id);
  }

  @Post()
  async create(
    @Body() createScheduleDto: CreateScheduleDto,
  ): Promise<Schedule> {
    return await this.scheduleService.create(createScheduleDto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateScheduleDto: UpdateScheduleDto,
  ): Promise<Schedule> {
    return await this.scheduleService.update(id, updateScheduleDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.scheduleService.remove(id);
  }
}
