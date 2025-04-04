import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ClassTestScheduleEntity } from 'src/classTestSchedule/classTestSchedule.entity';
import { Student } from 'src/student/student.entity';
import { Teacher } from 'src/teacher/teacher.entity';
import { Assessments } from 'src/assessments/assessments.entity';

@Entity('StudentScore')
export class StudentScoreEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  studentID: number;

  @Column()
  teacherID: number;

  @Column()
  classTestScheduleID: number;

  @Column({ type: 'text', nullable: true }) // Thêm teacherComment
  teacherComment: string;

  @Column({ nullable: true }) // Thêm assessmentID
  assessmentID: number;

  @ManyToOne(() => Teacher, (teacher) => teacher.studentScores, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'teacherID' })
  teacher: Teacher;

  @ManyToOne(() => Student, (student) => student.studentScores, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'studentID' })
  student: Student;

  @ManyToOne(
    () => ClassTestScheduleEntity,
    (classTestSchedule) => classTestSchedule.studentScores,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'classTestScheduleID' })
  classTestSchedule: ClassTestScheduleEntity;

  @ManyToOne(() => Assessments, (assessments) => assessments.testResults, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'assessmentID' }) // Liên kết với bảng Assessments
  assessment: Assessments;
}
