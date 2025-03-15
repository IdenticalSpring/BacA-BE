import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { Class } from '../class/class.entity';
import { Schedule } from '../schedule/schedule.entity';

@Entity('lesson_by_schedule')
export class LessonBySchedule {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Class, (classEntity) => classEntity.classSchedules, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'classID' })
  class: Class; // Dùng `classEntity`, không phải `class`

  @ManyToOne(() => Schedule, (schedule) => schedule.classSchedules, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'scheduleID' })
  schedule: Schedule;

  @Column({ type: 'time', nullable: false })
  startTime: string;

  @Column({ type: 'time', nullable: false })
  endTime: string;
  @Column({ type: 'date', nullable: false })
  date: Date;
  @Column({ type: 'int', nullable: true })
  lessonID: number;
  @Column({ type: 'boolean', default: false })
  isDelete: boolean;
}
