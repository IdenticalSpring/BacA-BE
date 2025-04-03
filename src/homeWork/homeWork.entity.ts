import { Student_homework_count } from 'src/student_homework_count/student_homework_count.entity';
import { Teacher } from 'src/teacher/teacher.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

@Entity('homework')
export class HomeWork {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, nullable: false })
  title: string;

  @Column({ type: 'text', nullable: true })
  linkYoutube: string;
  @Column({ type: 'text', nullable: true })
  linkGame: string;
  @Column({ type: 'text', nullable: true })
  linkSpeech: string;
  @Column({ type: 'text', nullable: true })
  linkZalo: string;

  @Column({ type: 'longtext', nullable: true })
  description: string;
  @Column({ type: 'int', nullable: true })
  level: number;
  @Column({ type: 'boolean', default: false })
  status: boolean;
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
    () => Student_homework_count,
    (student_homework_count) => student_homework_count.homework,
  )
  student_homework_count: Student_homework_count[];
}
