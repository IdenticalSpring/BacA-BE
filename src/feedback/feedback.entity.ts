import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Student } from 'src/student/student.entity';

@Entity('feedback')
export class Feedback {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, nullable: false })
  title: string;

  @Column({ type: 'text', nullable: false })
  description: string;

  @ManyToOne(() => Student, (student) => student.id, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'studentID' })
  student: Student;

  @CreateDateColumn()
  datetime: Date;
}
