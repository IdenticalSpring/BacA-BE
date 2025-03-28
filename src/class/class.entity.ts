import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Teacher } from '../teacher/teacher.entity';
import { TestResult } from '../testresult/testresult.entity';
import { ClassSchedule } from '../classSchedule/classSchedule.entity';
import { LessonBySchedule } from '../lesson_by_schedule/lesson_by_schedule.entity';
import { Student } from 'src/student/student.entity';

@Entity('class')
export class Class {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, nullable: false })
  name: string;

  @ManyToOne(() => Teacher, (teacher) => teacher.classes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'teacherID' })
  teacher: Teacher;
  @Column({ length: 50, nullable: true })
  level: string;
  @Column({ type: 'boolean', default: false })
  isDelete: boolean;
  @OneToMany(() => ClassSchedule, (classSchedule) => classSchedule.class)
  classSchedules: ClassSchedule[];
  @OneToMany(
    () => LessonBySchedule,
    (lessonBySchedule) => lessonBySchedule.class,
  )
  lessonBySchedule: LessonBySchedule[];

  @OneToMany(() => TestResult, (testResult) => testResult.classEntity)
  testResults: TestResult[];

  @OneToMany(() => Student, (student) => student.class)
  students: Student[];
}
