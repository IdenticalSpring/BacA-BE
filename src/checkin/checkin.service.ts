import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Checkin } from './checkin.entity';

@Injectable()
export class CheckinService {
  constructor(
    @InjectRepository(Checkin)
    private readonly checkinRepository: Repository<Checkin>,
  ) {}

  async createCheckin(
    lessonByScheduleId: number,
    studentId: number,
    present: number,
    note?: string,
  ) {
    const checkin = this.checkinRepository.create({
      lessonBySchedule: { id: lessonByScheduleId },
      student: { id: studentId },
      present,
      note,
    });
    return await this.checkinRepository.save(checkin);
  }

  async getCheckinsByLesson(lessonByScheduleId: number) {
    return await this.checkinRepository.find({
      where: { lessonBySchedule: { id: lessonByScheduleId } },
      relations: ['student', 'lessonBySchedule'],
    });
  }
}
