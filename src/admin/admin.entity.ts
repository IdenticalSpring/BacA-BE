import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('admin')
export class Admin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, nullable: false, unique: true })
  username: string;

  @Column({ length: 255, nullable: false })
  password: string;
  @Column({ type: 'boolean', default: false })
  isDelete: boolean;
}
