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

  @Column({ type: 'text', nullable: true })
  description: string;
  @OneToMany(() => ClassSchedule, (classSchedule) => classSchedule.lesson)
  classSchedules: ClassSchedule[];
}
