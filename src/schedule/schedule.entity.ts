import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Class } from '../class/class.entity';
import { Student } from '../student/student.entity';
import { TeacherCommentOnStudent } from '../teachercommentonstudent/teachercommentonstudent.entity';
import { TeacherTestComment } from '../teachertestcomment/teachertestcomment.entity';

@Entity('schedule')
export class Schedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'time', nullable: false })
  startTime: string;

  @Column({ type: 'time', nullable: false })
  endTime: string;

  @Column({ type: 'date', nullable: false })
  date: Date;

  @OneToMany(() => Class, (classEntity) => classEntity.schedule)
  classes: Class[];

  @OneToMany(() => Student, (student) => student.schedule)
  students: Student[];

  @OneToMany(() => TeacherCommentOnStudent, (comment) => comment.schedule)
  commentsOnStudents: TeacherCommentOnStudent[];

  @OneToMany(() => TeacherTestComment, (testComment) => testComment.schedule)
  testComments: TeacherTestComment[];
}
