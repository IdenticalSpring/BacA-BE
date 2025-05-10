import { HomeWork } from 'src/homeWork/homeWork.entity';
import { Student } from 'src/student/student.entity';
import { Student_vocabulary } from 'src/student_vocabulary/student_vocabulary.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

@Entity('vocabulary')
export class Vocabulary {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: 'text', nullable: true })
  imageUrl: string;
  @Column({ type: 'text', nullable: true })
  audioUrl: string;
  @Column({ type: 'longtext', nullable: true })
  textToSpeech: string;
  @ManyToOne(() => HomeWork, (homeworkEntity) => homeworkEntity.vocabularies, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'homeworkId' })
  homework: HomeWork;
  @ManyToOne(() => Student, (studentEntity) => studentEntity.vocabularies, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'studentId' })
  student: Student;
  @Column({ type: 'boolean', default: false })
  isDelete: boolean;
  @OneToMany(
    () => Student_vocabulary,
    (student_vocabulary) => student_vocabulary.vocabulary,
  )
  student_vocabularies: Student_vocabulary[];
}
