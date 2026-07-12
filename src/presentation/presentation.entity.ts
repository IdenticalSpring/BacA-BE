import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('presentations')
export class Presentation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 180, nullable: false })
  title: string;

  @Column({ type: 'int', nullable: true })
  lessonId: number;

  @Column({ type: 'int', nullable: true })
  lessonByScheduleId: number;

  @Column({ length: 20, default: 'teacher' })
  ownerRole: string;

  @Column({ type: 'int', nullable: true })
  ownerId: number;

  @Column({ type: 'longtext', nullable: true })
  contentJson: string;

  @Column({ type: 'longtext', nullable: true })
  metadataJson: string;

  @Column({ length: 20, default: 'draft' })
  status: string;

  @Column({ length: 20, default: 'vi' })
  language: string;

  @Column({ type: 'int', default: 1 })
  version: number;

  @Column({ type: 'text', nullable: true })
  thumbnailUrl: string;

  @Column({ type: 'boolean', default: false })
  isDeleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
