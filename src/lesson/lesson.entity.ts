import { Teacher } from 'src/teacher/teacher.entity';
import { ClassSchedule } from '../classSchedule/classSchedule.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('lesson')
export class Lesson {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  linkYoutube: string;
  @Column({ type: 'text', nullable: true })
  linkSpeech: string;

  @Column({ type: 'longtext', nullable: true })
  description: string;
  @Column({ type: 'int', nullable: true })
  level: number;
  @Column({ type: 'boolean', default: false })
  isDelete: boolean;
  @OneToMany(() => ClassSchedule, (classSchedule) => classSchedule.lesson)
  classSchedules: ClassSchedule[];
  @ManyToOne(() => Teacher, (teacherEntity) => teacherEntity.lesson, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'TeacherId' })
  teacher: Teacher;
}
