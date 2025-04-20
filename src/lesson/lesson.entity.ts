import { Teacher } from 'src/teacher/teacher.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Student_lesson_count } from 'src/student-lesson-count/student-lesson-count.entity';

@Entity('lesson')
export class Lesson {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  linkYoutube: string;
  @Column({ type: 'text', nullable: true })
  linkGame: string;
  @Column({ type: 'text', nullable: true })
  linkSpeech: string;

  @Column({ type: 'longtext', nullable: true })
  textToSpeech: string;
  @Column({ type: 'longtext', nullable: true })
  description: string;

  @Column({ type: 'longtext', nullable: true })
  lessonPlan: string;

  @Column({ type: 'int', nullable: true })
  level: number;
  @Column({ type: 'boolean', default: false })
  isDelete: boolean;

  @Column({ type: 'date', nullable: true }) // Thêm trường date
  date: Date;

  @ManyToOne(() => Teacher, (teacherEntity) => teacherEntity.lesson, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'TeacherId' })
  teacher: Teacher;
  @OneToMany(
    () => Student_lesson_count,
    (student_lesson_count) => student_lesson_count.lesson,
  )
  student_lesson_count: Student_lesson_count[];
}
