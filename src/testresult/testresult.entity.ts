import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Student } from '../student/student.entity';
import { Class } from '../class/class.entity';
import { TestType } from '../testtype/testtype.entity';
import { Assessments } from '../assessments/assessments.entity';
import { TeacherTestComment } from '../teachertestcomment/teachertestcomment.entity';

@Entity('testresult')
export class TestResult {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Student, (student) => student.testResults, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'studentID' })
  student: Student;

  @ManyToOne(() => Class, (classEntity) => classEntity.testResults, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'classID' })
  classEntity: Class;

  @ManyToOne(() => TestType, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'testTypeID' })
  testType: TestType;

  @ManyToOne(() => Assessments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'assessmentsID' })
  assessments: Assessments;

  @ManyToOne(() => TeacherTestComment, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'teacherCommentID' })
  teacherComment: TeacherTestComment;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  listenScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  speakingScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  readingWritingScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  averageScore: number;
  @Column({ type: 'boolean', default: false })
  isDelete: boolean;
}
