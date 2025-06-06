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
import { Class } from 'src/class/class.entity';

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

  @Column({ length: 50, unique: true, nullable: false })
  username: string;

  @Column({ length: 255, nullable: false })
  password: string;
  @Column({ type: 'boolean', default: false })
  isDelete: boolean;

  @ManyToOne(() => Class, (classEntity) => classEntity.students, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'classID' })
  class: Class;

  @OneToMany(() => TestResult, (testResult) => testResult.student)
  testResults: TestResult[]; // Đã sửa thành mảng []

  @ManyToOne(() => Schedule, (schedule) => schedule.students, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'scheduleID' })
  schedule: Schedule;
}
