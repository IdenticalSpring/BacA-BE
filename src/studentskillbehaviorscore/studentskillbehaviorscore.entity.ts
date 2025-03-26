import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TeacherCommentOnStudent } from '../teachercommentonstudent/teachercommentonstudent.entity';
import { Skills } from '../skill/skill.entity';

@Entity('studentskillbehaviorscore')
export class StudentSkillBehaviorScore {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => TeacherCommentOnStudent, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'teacherCommentID' })
  teacherComment: TeacherCommentOnStudent;

  @Column()
  studentID: number;

  @ManyToOne(() => Skills, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'skillID' })
  skill: Skills;

  @Column()
  skillType: string;

  @Column({ type: 'int' })
  score: number;
}
