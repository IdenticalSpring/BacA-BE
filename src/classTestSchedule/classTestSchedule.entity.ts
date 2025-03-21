import { Class } from 'src/class/class.entity';
import { StudentScoreEntity } from 'src/studentScore/studentScore.entity';
import { TestEntity } from 'src/test/test.entity';
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

  @Column()
  classID: number;

  @Column()
  testID: number;

  @ManyToOne(() => Class, (classEntity) => classEntity.classTestSchedules, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'classID' })
  class: Class;

  @Column()
  date: Date;

  @ManyToOne(() => TestEntity, (test) => test.classTestSchedules, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'testID' })
  test: TestEntity;

  @OneToMany(
    () => StudentScoreEntity,
    (studentScore) => studentScore.classTestSchedule,
  )
  studentScores: StudentScoreEntity[];
}
