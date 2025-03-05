import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Teacher } from '../teacher/teacher.entity';
import { Schedule } from '../schedule/schedule.entity';
import { TestResult } from '../testresult/testresult.entity';

@Entity('class')
export class Class {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, nullable: false })
  name: string;

  @Column({ type: 'date', nullable: false })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @ManyToOne(() => Teacher, (teacher) => teacher.classes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'teacherID' })
  teacher: Teacher;

  @ManyToOne(() => Schedule, (schedule) => schedule.classes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'scheduleID' })
  schedule: Schedule;

  @OneToMany(() => TestResult, (testResult) => testResult.classEntity)
  testResults: TestResult[];
}
