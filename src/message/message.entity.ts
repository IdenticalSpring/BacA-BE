// src/message/message.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Class } from 'src/class/class.entity';
import { Student } from 'src/student/student.entity';
import { Teacher } from 'src/teacher/teacher.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: true }) // Tin nhắn có thể chỉ là ảnh hoặc audio
  content: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  audioUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'boolean', default: false })
  isRecalled: boolean; // Cờ để đánh dấu tin nhắn đã bị thu hồi

  // Mối quan hệ: Tin nhắn này thuộc về lớp học nào
  @ManyToOne(() => Class, (cls) => cls.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'classId' })
  class: Class;

  // Người gửi tin nhắn (có thể là học sinh)
  @ManyToOne(() => Student, (student) => student.sentMessages, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'senderStudentId' })
  senderStudent: Student;

  // hoặc người gửi có thể là giáo viên
  @ManyToOne(() => Teacher, (teacher) => teacher.sentMessages, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'senderTeacherId' })
  senderTeacher: Teacher;

  // Thêm một cột để dễ dàng xác định vai trò người gửi mà không cần join
  @Column({ type: 'varchar', length: 10 })
  senderType: 'student' | 'teacher';
}
