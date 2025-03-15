import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { TestResult } from '../testresult/testresult.entity';

@Entity('assessments')
export class Assessments {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, nullable: false })
  name: string;
  @Column({ type: 'boolean', default: false })
  isDelete: boolean;
  @OneToMany(() => TestResult, (testResult) => testResult.assessments)
  testResults: TestResult[];
}
