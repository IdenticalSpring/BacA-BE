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
        date: new Date(), // Gán ngày hiện tại
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
      throw new NotFoundException(`Student with ID ${studentId} not found`);
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

  async updateCheckin(id: number, updateData: Partial<Checkin>) {
    const checkin = await this.checkinRepository.findOne({ where: { id } });
    if (!checkin) {
      throw new NotFoundException(`Checkin with ID ${id} not found`);
    }

    // Chuyển đổi kiểu dữ liệu date từ string sang Date nếu tồn tại
    if (updateData.date) {
      updateData.date = new Date(updateData.date as unknown as string);
    }

    Object.assign(checkin, updateData);
    return this.checkinRepository.save(checkin);
  }

  async updateCheckinByStudentId(
    studentId: number,
    updateData: Partial<Checkin>,
  ) {
    const checkins = await this.checkinRepository.find({
      where: { student: { id: studentId } },
    });

    if (!checkins || checkins.length === 0) {
      throw new NotFoundException(
        `No checkins found for student ID ${studentId}`,
      );
    }

    // Cập nhật tất cả các bản ghi checkin liên quan đến studentId
    const updatedCheckins = checkins.map((checkin) => {
      if (updateData.date) {
        updateData.date = new Date(updateData.date as unknown as string);
      }
      return Object.assign(checkin, updateData);
    });

    return this.checkinRepository.save(updatedCheckins);
  }
  async getCheckinsByDate(date: string): Promise<Checkin[]> {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0); // Đặt thời gian bắt đầu của ngày

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999); // Đặt thời gian kết thúc của ngày

    console.log('Start Date:', startDate, 'End Date:', endDate); // Debug log

    return this.checkinRepository
      .createQueryBuilder('checkin')
      .leftJoinAndSelect('checkin.student', 'student')
      .leftJoinAndSelect('checkin.lessonBySchedule', 'lessonBySchedule')
      .where('checkin.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getMany();
  }

  async deleteCheckin(id: number) {
    const checkin = await this.checkinRepository.findOne({ where: { id } });
    if (!checkin) {
      throw new NotFoundException(`Checkin with ID ${id} not found`);
    }
    return this.checkinRepository.remove(checkin);
  }
}
