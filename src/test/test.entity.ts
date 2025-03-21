import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ClassTestScheduleEntity } from 'src/classTestSchedule/classTestSchedule.entity';

@Entity('test')
export class TestEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(
    () => ClassTestScheduleEntity,
    (classTestSchedule) => classTestSchedule.test,
  )
  classTestSchedules: ClassTestScheduleEntity[];
}
