import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('level')
export class Level {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, nullable: false, unique: true })
  name: string;

  @Column({ type: 'text' })
  description: string;
  @Column({ type: 'boolean', default: false })
  isDelete: boolean;
}
