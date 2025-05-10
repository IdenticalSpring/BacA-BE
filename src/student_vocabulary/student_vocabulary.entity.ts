import { HomeWork } from 'src/homeWork/homeWork.entity';
import { Student } from 'src/student/student.entity';
import { Vocabulary } from 'src/vocabulary/vocabulary.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('student_vocabulary')
export class Student_vocabulary {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: true })
  text: string;

  @Column({ type: 'boolean', default: false })
  isDelete: boolean;
  @ManyToOne(
    () => Vocabulary,
    (vocabularyEntity) => vocabularyEntity.student_vocabularies,
    {
      onDelete: 'SET NULL',
    },
  )
  @JoinColumn({ name: 'vocabularyId' })
  vocabulary: Vocabulary;
  @ManyToOne(
    () => Student,
    (studentEntity) => studentEntity.student_vocabularies,
    {
      onDelete: 'SET NULL',
    },
  )
  @JoinColumn({ name: 'studentId' })
  student: Student;
  @ManyToOne(
    () => HomeWork,
    (homeworkEntity) => homeworkEntity.student_vocabularies,
    {
      onDelete: 'SET NULL',
    },
  )
  @JoinColumn({ name: 'homeworkId' })
  homework: HomeWork;
}
