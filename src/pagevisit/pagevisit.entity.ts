import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('pagevisit')
export class PageVisit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', default: 0 })
  visitCount: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastVisit: Date;
}
