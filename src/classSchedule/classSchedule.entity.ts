import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { Class } from '../class/class.entity';
import { Schedule } from '../schedule/schedule.entity';
import { Lesson } from '../lesson/lesson.entity';

@Entity('class_schedule')
export class ClassSchedule {
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
  @Column({ type: 'boolean', default: false })
  isDelete: boolean;
}
