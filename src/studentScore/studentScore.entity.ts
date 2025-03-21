import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ClassTestScheduleEntity } from 'src/classTestSchedule/classTestSchedule.entity';
import { Student } from 'src/student/student.entity';

@Entity('StudentScore')
export class StudentScoreEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  studentID: number;

  @Column()
  classTestScheduleID: number;

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
}
