import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { StudentScoreEntity } from 'src/studentScore/studentScore.entity';
import { TestSkill } from 'src/test_skills/test_skills.entity';

@Entity('student_score_details')
export class StudentScoreDetails {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  studentScoreID: number;

  @Column()
  testSkillID: number;

  @Column('decimal', { precision: 5, scale: 2 })
  score: number;

  @Column('decimal', { precision: 5, scale: 2 })
  avgScore: number;

  @ManyToOne(() => StudentScoreEntity, (studentScore) => studentScore.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'studentScoreID' })
  studentScore: StudentScoreEntity;

  @ManyToOne(() => TestSkill, (testSkill) => testSkill.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'testSkillID' })
  testSkill: TestSkill;
}
