import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Schedule } from './schedule.entity';
import { CreateScheduleDto, UpdateScheduleDto } from './schedule.dto';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
  ) {}

  async findAll(): Promise<Schedule[]> {
    return await this.scheduleRepository.find({ where: { isDelete: false } });
  }
  async findByDayOfWeek(dayOfWeek: number): Promise<Schedule[]> {
    console.log('dayOfWeek', dayOfWeek);
    return await this.scheduleRepository.find({
      where: { dayOfWeek, isDelete: false },
    });
  }
  async findOne(id: number): Promise<Schedule> {
    const schedule = await this.scheduleRepository.findOne({
      where: { id, isDelete: false },
    });
    if (!schedule) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }
    return schedule;
  }

  async create(createScheduleDto: CreateScheduleDto): Promise<Schedule> {
    const schedule = this.scheduleRepository.create(createScheduleDto);
    return await this.scheduleRepository.save(schedule);
  }

  async update(
    id: number,
    updateScheduleDto: UpdateScheduleDto,
  ): Promise<Schedule> {
    const schedule = await this.findOne(id);
    Object.assign(schedule, updateScheduleDto);
    return await this.scheduleRepository.save(schedule);
  }

  async remove(id: number): Promise<void> {
    // const result = await this.scheduleRepository.delete(id);
    // if (result.affected === 0) {
    //   throw new NotFoundException(`Schedule with ID ${id} not found`);
    // }
    const Schedule = await this.scheduleRepository.findOne({
      where: { id, isDelete: false },
    });
    if (!Schedule) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }
    Schedule.isDelete = true;
    await this.scheduleRepository.save(Schedule);
  }
}
