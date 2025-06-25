import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Teacher } from '../teacher/teacher.entity';
import { Class } from '../class/class.entity';
import { HomeWork } from '../homeWork/homeWork.entity'; // Thêm dòng này

@Entity('question')
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Teacher, { eager: true })
  @JoinColumn({ name: 'teacherID' })
  teacher: Teacher;

  @ManyToOne(() => Class, { eager: true })
  @JoinColumn({ name: 'classID' })
  class: Class;

  @ManyToOne(() => HomeWork, { eager: true, nullable: true }) // Thêm quan hệ này
  @JoinColumn({ name: 'homeWorkId' })
  homeWork: HomeWork;

  @Column({ type: 'text', nullable: false })
  text: string;

  @Column({ type: 'text', nullable: true })
  imageUrl: string;

  @Column({ type: 'boolean', default: false })
  isDelete: boolean;
}
