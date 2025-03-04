import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { TestResult } from '../testresult/testresult.entity';

@Entity('assessments')
export class Assessments {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, nullable: false })
  name: string;

  @OneToMany(() => TestResult, (testResult) => testResult.assessments)
  testResults: TestResult[];
}
