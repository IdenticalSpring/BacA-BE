import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Class } from '../class/class.entity';
import { TeacherCommentOnStudent } from '../teachercommentonstudent/teachercommentonstudent.entity';
import { TeacherTestComment } from '../teachertestcomment/teachertestcomment.entity';
import { Lesson } from 'src/lesson/lesson.entity';
import { HomeWork } from 'src/homeWork/homeWork.entity';
import { StudentScoreEntity } from 'src/studentScore/studentScore.entity';
import { TeacherFeedback } from 'src/teacher_feedback/teacher_feedback.entity';

@Entity('teacher')
export class Teacher {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, nullable: false })
  name: string;

  @Column({ length: 50, unique: true, nullable: false })
  username: string;

  @Column({ length: 255, nullable: false })
  password: string;

  @Column({ length: 255, nullable: false })
  fileUrl: string;

  @Column({ length: 255, nullable: false })
  linkDrive: string;

  @Column({ type: 'date', nullable: false })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;
  @Column({ type: 'boolean', default: false })
  isDelete: boolean;
  // Một giáo viên có thể dạy nhiều lớp
  @OneToMany(() => Class, (classEntity) => classEntity.teacher)
  classes: Class[];

  // Một giáo viên có thể bình luận về nhiều học sinh
  @OneToMany(() => TeacherCommentOnStudent, (comment) => comment.teacher)
  commentsOnStudents: TeacherCommentOnStudent[];

  // Một giáo viên có thể viết nhiều nhận xét bài kiểm tra
  @OneToMany(() => TeacherTestComment, (testComment) => testComment.teacher)
  testComments: TeacherTestComment[];
  @OneToMany(() => Lesson, (lesson) => lesson.teacher)
  lesson: Lesson[];
  @OneToMany(() => HomeWork, (homeWork) => homeWork.teacher)
  homeWork: HomeWork[];

  @OneToMany(() => StudentScoreEntity, (studentScore) => studentScore.teacher)
  studentScores: StudentScoreEntity[];

  @OneToMany(() => TeacherFeedback, (feedback) => feedback.teacher)
  feedbacks: TeacherFeedback[];
}
