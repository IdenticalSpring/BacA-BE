import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Class } from '../class/class.entity';
import { TeacherCommentOnStudent } from '../teachercommentonstudent/teachercommentonstudent.entity';
import { TeacherTestComment } from '../teachertestcomment/teachertestcomment.entity';

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

  @Column({ length: 50, nullable: true })
  level: string;

  @Column({ type: 'date', nullable: false })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  // Một giáo viên có thể dạy nhiều lớp
  @OneToMany(() => Class, (classEntity) => classEntity.teacher)
  classes: Class[];

  // Một giáo viên có thể bình luận về nhiều học sinh
  @OneToMany(() => TeacherCommentOnStudent, (comment) => comment.teacher)
  commentsOnStudents: TeacherCommentOnStudent[];

  // Một giáo viên có thể viết nhiều nhận xét bài kiểm tra
  @OneToMany(() => TeacherTestComment, (testComment) => testComment.teacher)
  testComments: TeacherTestComment[];
}
