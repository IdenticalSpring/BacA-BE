import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Lesson } from 'src/lesson/lesson.entity';
import { Student } from 'src/student/student.entity';
import { LessonBySchedule } from 'src/lesson_by_schedule/lesson_by_schedule.entity';

@Entity('student_lesson_count')
export class Student_lesson_count {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: 'int', default: 0 })
  count: number;
  @Column({ type: 'boolean', default: false })
  isDelete: boolean;
  @ManyToOne(
    () => Lesson,
    (lessonEntity) => lessonEntity.student_lesson_count,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'lessonId' })
  lesson: Lesson;
  @ManyToOne(
    () => Student,
    (studentEntity) => studentEntity.student_lesson_count,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'studentId' })
  student: Student;
  @ManyToOne(
    () => LessonBySchedule,
    (LessonByScheduleEntity) => LessonByScheduleEntity.student_lesson_count,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'lessonByScheduleId' })
  lessonBySchedule: LessonBySchedule;
}
