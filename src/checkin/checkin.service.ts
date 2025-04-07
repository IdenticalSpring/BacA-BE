import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Checkin } from './checkin.entity';
import { Student } from 'src/student/student.entity';
import { LessonBySchedule } from 'src/lesson_by_schedule/lesson_by_schedule.entity';

@Injectable()
export class CheckinService {
  constructor(
    @InjectRepository(Checkin)
    private readonly checkinRepository: Repository<Checkin>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(LessonBySchedule)
    private readonly lessonByScheduleRepository: Repository<LessonBySchedule>,
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
  async getAllCheckins(): Promise<Checkin[]> {
    return this.checkinRepository.find({
      relations: ['student', 'lessonBySchedule'], // Lấy thông tin khóa ngoại
    });
  }
  async getAllCheckinOfStudent(studentId: number) {
    const studentEntity = await this.studentRepository.findOne({
      where: { id: studentId },
    });
    if (!studentEntity) {
      throw new NotFoundException(`student with ID ${studentId} not found`);
    }
    return this.checkinRepository.find({
      where: { student: studentEntity },
      relations: ['student', 'lessonBySchedule'],
    });
  }
  async getAllCheckinOfLessonBySchedule(LessonByScheduleId: number) {
    const LessonByScheduleEntity =
      await this.lessonByScheduleRepository.findOne({
        where: { id: LessonByScheduleId },
      });
    console.log(LessonByScheduleEntity);

    if (!LessonByScheduleEntity) {
      throw new NotFoundException(
        `LessonBySchedule with ID ${LessonByScheduleId} not found`,
      );
    }
    return this.checkinRepository.find({
      where: { lessonBySchedule: LessonByScheduleEntity },
      relations: ['student', 'lessonBySchedule'],
    });
  }
}
