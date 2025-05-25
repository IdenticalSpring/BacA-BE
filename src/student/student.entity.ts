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
import { Checkin } from 'src/checkin/checkin.entity';
import { StudentScoreEntity } from 'src/studentScore/studentScore.entity';
import { UserNotification } from 'src/user_notification/user_notification.entity';
import { Student_homework_count } from 'src/student_homework_count/student_homework_count.entity';
import { Student_lesson_count } from 'src/student-lesson-count/student-lesson-count.entity';
import { Vocabulary } from 'src/vocabulary/vocabulary.entity';
import { Student_vocabulary } from 'src/student_vocabulary/student_vocabulary.entity';

@Entity('student') // Đặt tên bảng đúng với MySQL
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, nullable: false })
  name: string;

  @Column({ type: 'int', nullable: true })
  level: number;

  // @Column({ type: 'date', nullable: true })
  // yearOfBirth: Date;

  @Column({ length: 100, nullable: true })
  phone: string;

  @Column({ length: 100, nullable: true })
  imgUrl: string;

  @Column({ type: 'date', nullable: false })
  startDate: Date;

  // @Column({ type: 'date', nullable: true })
  // endDate: Date;

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

  @OneToMany(() => Checkin, (checkin) => checkin.student)
  checkins: Checkin[];

  @OneToMany(() => StudentScoreEntity, (studentScore) => studentScore.student)
  studentScores: StudentScoreEntity[];
  @OneToMany(
    () => UserNotification,
    (user_notification) => user_notification.student,
  )
  userNotifications: UserNotification[];
  @OneToMany(
    () => Student_homework_count,
    (student_homework_count) => student_homework_count.student,
  )
  student_homework_count: Student_homework_count[];
  @OneToMany(
    () => Student_lesson_count,
    (student_lesson_count) => student_lesson_count.student,
  )
  student_lesson_count: Student_lesson_count[];
  @OneToMany(() => Vocabulary, (vocabulary) => vocabulary.student)
  vocabularies: Vocabulary[];
  @OneToMany(
    () => Student_vocabulary,
    (student_vocabulary) => student_vocabulary.student,
  )
  student_vocabularies: Student_vocabulary[];
}
