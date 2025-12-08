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

export type SenderRole = 'student' | 'teacher';

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

  // *** THÊM TRƯỜNG NÀY ***
  @Column({
    type: 'enum',
    enum: ['student', 'teacher'],
    nullable: false,
  })
  senderRole: SenderRole;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  audioUrl: string;

  @Column({ type: 'text', nullable: true })
  imageUrl: string;

  @Column({ type: 'boolean', default: false })
  isRevoked: boolean;

  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  // AI Chatbot fields
  @Column({ type: 'boolean', default: false })
  isAI: boolean;

  @Column({ type: 'int', nullable: true })
  senderID: number;

  @CreateDateColumn()
  createdAt: Date;
}
