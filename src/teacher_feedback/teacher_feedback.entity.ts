import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Teacher } from '../teacher/teacher.entity';

@Entity('teacher_feedback')
export class TeacherFeedback {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, nullable: false })
  title: string;

  @Column({ type: 'text', nullable: false })
  description: string;

  @ManyToOne(() => Teacher, (teacher) => teacher.id, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'teacherID' })
  teacher: Teacher;

  @CreateDateColumn()
  datetime: Date;
}
