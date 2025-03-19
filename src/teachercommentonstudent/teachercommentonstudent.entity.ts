import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Teacher } from '../teacher/teacher.entity';
import { Student } from '../student/student.entity';
import { Schedule } from '../schedule/schedule.entity';

@Entity('teachercommentonstudent')
export class TeacherCommentOnStudent {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Teacher, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'teacherID' })
  teacher: Teacher;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentID' })
  student: Student;

  @ManyToOne(() => Schedule, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'scheduleID' })
  schedule: Schedule;

  @Column({ type: 'text', nullable: false })
  comment: string;

  @Column({ type: 'boolean', default: false })
  isDelete: boolean;

  // ✅ Đánh giá bằng số sao (0 - 4)
  @Column({ type: 'tinyint', default: 0 }) vocabulary: number;
  @Column({ type: 'tinyint', default: 0 }) structure: number;
  @Column({ type: 'tinyint', default: 0 }) listening: number;
  @Column({ type: 'tinyint', default: 0 }) speaking: number;
  @Column({ type: 'tinyint', default: 0 }) reading: number;
  @Column({ type: 'tinyint', default: 0 }) writing: number;

  // ✅ Behavior đánh giá bằng sao (0 - 4)
  @Column({ type: 'tinyint', default: 0 }) respect: number;
  @Column({ type: 'tinyint', default: 0 }) discipline: number;
  @Column({ type: 'tinyint', default: 0 }) cooperation: number;
}
