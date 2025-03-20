import { Class } from 'src/class/class.entity';
import { StudentScoreEntity } from 'src/studentScore/studentScore.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

@Entity('ClassTestSchedule')
export class ClassTestScheduleEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Class, (classEntity) => classEntity.classTestSchedules, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'classID' })
  class: Class;

  @Column()
  date: Date;

  @OneToMany(
    () => StudentScoreEntity,
    (studentScore) => studentScore.classTestSchedule,
  )
  studentScores: StudentScoreEntity[];
}
