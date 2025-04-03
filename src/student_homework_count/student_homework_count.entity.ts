import { HomeWork } from 'src/homeWork/homeWork.entity';
import { Student } from 'src/student/student.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('student_homework_count')
export class Student_homework_count {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: 'int', default: 0 })
  count: number;
  @Column({ type: 'boolean', default: false })
  isDelete: boolean;
  @ManyToOne(
    () => HomeWork,
    (homeworkEntity) => homeworkEntity.student_homework_count,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'homeworkId' })
  homework: HomeWork;
  @ManyToOne(
    () => Student,
    (studentEntity) => studentEntity.student_homework_count,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'studentId' })
  student: Student;
}
