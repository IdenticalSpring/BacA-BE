import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Student } from '../student/student.entity';
import { TeacherCommentOnStudent } from '../teachercommentonstudent/teachercommentonstudent.entity';
import { TeacherTestComment } from '../teachertestcomment/teachertestcomment.entity';
import { ClassSchedule } from '../classSchedule/classSchedule.entity';

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

  @OneToMany(() => Student, (student) => student.schedule)
  students: Student[];

  @OneToMany(() => TeacherCommentOnStudent, (comment) => comment.schedule)
  commentsOnStudents: TeacherCommentOnStudent[];

  @OneToMany(() => TeacherTestComment, (testComment) => testComment.schedule)
  testComments: TeacherTestComment[];

  @OneToMany(() => ClassSchedule, (classSchedule) => classSchedule.schedule)
  classSchedules: ClassSchedule[];
}
