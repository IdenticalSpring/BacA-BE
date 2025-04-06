import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { Class } from '../class/class.entity';
import { Schedule } from '../schedule/schedule.entity';
import { Checkin } from 'src/checkin/checkin.entity';
import { Student_homework_count } from 'src/student_homework_count/student_homework_count.entity';
import { Student_lesson_count } from 'src/student-lesson-count/student-lesson-count.entity';

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
  @Column({ type: 'int', nullable: true })
  homeWorkId: number;
  @Column({ type: 'boolean', default: false })
  isHomeWorkSent: boolean;
  @Column({ type: 'boolean', default: false })
  isLessonSent: boolean;
  @Column({ type: 'boolean', default: false })
  isDelete: boolean;
  @OneToMany(() => Checkin, (checkin) => checkin.lessonBySchedule)
  checkins: Checkin[];
  @OneToMany(
    () => Student_homework_count,
    (student_homework_count) => student_homework_count.lessonBySchedule,
  )
  student_homework_count: Student_homework_count[];
  @OneToMany(
    () => Student_lesson_count,
    (student_lesson_count) => student_lesson_count.lessonBySchedule,
  )
  student_lesson_count: Student_lesson_count[];
}
