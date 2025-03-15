import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Teacher } from '../teacher/teacher.entity';
import { Student } from '../student/student.entity';
import { Class } from '../class/class.entity';
import { Schedule } from '../schedule/schedule.entity';

@Entity('teachertestcomment')
export class TeacherTestComment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Teacher, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'teacherID' })
  teacher: Teacher;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentID' })
  student: Student;

  @ManyToOne(() => Class, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'classID' })
  classEntity: Class;

  @ManyToOne(() => Schedule, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'scheduleID' })
  schedule: Schedule;

  @Column({ type: 'text', nullable: false })
  skillComment: string;
  @Column({ type: 'boolean', default: false })
  isDelete: boolean;
}
