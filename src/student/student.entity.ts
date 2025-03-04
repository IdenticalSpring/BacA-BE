import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Schedule } from '../schedule/schedule.entity';
import { TestResult } from '../testresult/testresult.entity';

@Entity('student') // Đặt tên bảng đúng với MySQL
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, nullable: false })
  name: string;

  @Column({ length: 50, nullable: true })
  level: string;

  @Column({ type: 'date', nullable: false })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ type: 'text', nullable: true })
  note: string;

  @OneToMany(() => TestResult, (testResult) => testResult.student)
  testResults: TestResult[]; // Đã sửa thành mảng []

  @ManyToOne(() => Schedule, (schedule) => schedule.students, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'scheduleID' })
  schedule: Schedule;
}
