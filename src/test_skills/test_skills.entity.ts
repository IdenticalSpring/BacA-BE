import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('test_skills')
export class TestSkill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;
}
