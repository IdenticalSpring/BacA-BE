import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Question } from '../question/question.entity';
import { Student } from 'src/student/student.entity';
import { HomeWork } from 'src/homeWork/homeWork.entity';

@Entity('student_question_answer')
export class StudentQuestionAnswer {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Question, { eager: true })
  @JoinColumn({ name: 'questionID' })
  question: Question;

  @ManyToOne(() => Student, { eager: true })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @ManyToOne(() => HomeWork, { eager: true, nullable: true })
  @JoinColumn({ name: 'homeWorkId' })
  homeWork: HomeWork;

  @Column({ type: 'text', nullable: true }) answer: string;

  @Column({ type: 'text', nullable: true })
  text: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  audio: string;

  @Column({ type: 'boolean', default: false })
  isDelete: boolean;
}
