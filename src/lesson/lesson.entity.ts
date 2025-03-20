import { ClassSchedule } from '../classSchedule/classSchedule.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('lesson')
export class Lesson {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  link: string;

  @Column({ type: 'longtext', nullable: true })
  description: string;
  @Column({ length: 50, nullable: true })
  level: string;
  @Column({ type: 'boolean', default: false })
  isDelete: boolean;
  @OneToMany(() => ClassSchedule, (classSchedule) => classSchedule.lesson)
  classSchedules: ClassSchedule[];
}
