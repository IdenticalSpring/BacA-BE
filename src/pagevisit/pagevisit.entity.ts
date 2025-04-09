import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('pagevisit')
export class PageVisit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  date: string; // Lưu ngày truy cập

  @Column({ type: 'int', default: 0 })
  visitCount: number;
}
