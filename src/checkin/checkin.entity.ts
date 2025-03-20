import { LessonBySchedule } from 'src/lesson_by_schedule/lesson_by_schedule.entity';
import { Student } from 'src/student/student.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Checkin {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => LessonBySchedule, (lesson) => lesson.checkins, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  lessonBySchedule: LessonBySchedule;

  @ManyToOne(() => Student, (student) => student.checkins, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  student: Student;

  @Column({ type: 'tinyint', default: 1 })
  present: number; // 1: Có mặt, 0: Vắng mặt

  @Column({ type: 'text', nullable: true })
  note?: string; // Ghi chú

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
