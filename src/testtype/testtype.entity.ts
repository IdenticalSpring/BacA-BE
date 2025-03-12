import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { TestResult } from '../testresult/testresult.entity';

@Entity('testtype')
export class TestType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, nullable: false })
  name: string;
  @Column({ type: 'boolean', default: false })
  isDelete: boolean;
  @OneToMany(() => TestResult, (testResult) => testResult.testType)
  testResults: TestResult[];
}
