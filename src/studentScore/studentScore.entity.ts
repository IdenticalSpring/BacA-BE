import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Student } from '../student/student.entity';
import { ClassTestScheduleEntity } from '../classTestSchedule/classTestSchedule.entity';

@Entity('studentScore')
export class StudentScoreEntity {
  @PrimaryGeneratedColumn()
  id: number;

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

  @Column('float')
  writingScore: number;

  @Column('float')
  readingScore: number;

  @Column('float')
  speakingScore: number;

  @Column('float')
  listeningScore: number;

  @Column('float')
  avgScore: number;
}
