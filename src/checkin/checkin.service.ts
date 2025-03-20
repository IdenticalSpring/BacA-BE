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

  async createCheckins(
    lessonByScheduleId: number,
    attendanceData: { studentId: number; present: number; note?: string }[],
  ) {
    const checkinEntities = attendanceData.map((data) =>
      this.checkinRepository.create({
        lessonBySchedule: { id: lessonByScheduleId },
        student: { id: data.studentId },
        present: data.present,
        note: data.note,
      }),
    );
    return await this.checkinRepository.save(checkinEntities);
  }

  async getCheckinsByLesson(lessonByScheduleId: number) {
    return await this.checkinRepository.find({
      where: { lessonBySchedule: { id: lessonByScheduleId } },
      relations: ['student', 'lessonBySchedule'],
    });
  }
}
