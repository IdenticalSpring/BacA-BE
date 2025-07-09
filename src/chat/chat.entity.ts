import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Student } from '../student/student.entity';
import { Teacher } from '../teacher/teacher.entity';
import { Class } from '../class/class.entity';

@Entity('chat')
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Student, { nullable: true, onDelete: 'CASCADE' })
  student: Student;

  @ManyToOne(() => Teacher, { nullable: true, onDelete: 'CASCADE' })
  teacher: Teacher;

  @ManyToOne(() => Class, { nullable: false, onDelete: 'CASCADE' })
  class: Class;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  audioUrl: string;

  @Column({ type: 'boolean', default: false })
  isRevoked: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
