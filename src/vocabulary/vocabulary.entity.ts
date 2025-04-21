import { HomeWork } from 'src/homeWork/homeWork.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('vocabulary')
export class Vocabulary {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: 'text', nullable: true })
  imageUrl: string;
  @Column({ type: 'text', nullable: true })
  audioUrl: string;
  @Column({ type: 'longtext', nullable: true })
  textToSpeech: string;
  @ManyToOne(() => HomeWork, (homeworkEntity) => homeworkEntity.vocabularies, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'homeworkId' })
  homework: HomeWork;
  @Column({ type: 'boolean', default: false })
  isDelete: boolean;
}
