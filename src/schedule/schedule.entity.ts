import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Student } from '../student/student.entity';
import { TeacherCommentOnStudent } from '../teachercommentonstudent/teachercommentonstudent.entity';
import { TeacherTestComment } from '../teachertestcomment/teachertestcomment.entity';
import { ClassSchedule } from '../classSchedule/classSchedule.entity';
import { LessonBySchedule } from 'src/lesson_by_schedule/lesson_by_schedule.entity';

@Entity('schedule')
export class Schedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'time', nullable: false })
  startTime: string;

  @Column({ type: 'time', nullable: false })
  endTime: string;

  @Column({ type: 'tinyint', nullable: false })
  dayOfWeek: number;
  @Column({ type: 'boolean', default: false })
  isDelete: boolean;
  @OneToMany(() => Student, (student) => student.schedule)
  students: Student[];

  @OneToMany(() => TeacherCommentOnStudent, (comment) => comment.schedule)
  commentsOnStudents: TeacherCommentOnStudent[];

  @OneToMany(() => TeacherTestComment, (testComment) => testComment.schedule)
  testComments: TeacherTestComment[];
  @OneToMany(
    () => LessonBySchedule,
    (lessonBySchedule) => lessonBySchedule.schedule,
  )
  lessonBySchedule: LessonBySchedule[];
  @OneToMany(() => ClassSchedule, (classSchedule) => classSchedule.schedule)
  classSchedules: ClassSchedule[];
}
