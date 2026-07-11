import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('presentation_shares')
export class PresentationShare {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  presentationId: number;

  @Column({ length: 96, unique: true })
  token: string;

  @Column({ length: 20, default: 'read' })
  permission: string;

  @Column({ type: 'boolean', default: false })
  canDownload: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'datetime', nullable: true })
  expiresAt: Date;

  @Column({ type: 'int', nullable: true })
  createdById: number;

  @Column({ length: 20, nullable: true })
  createdByRole: string;

  @CreateDateColumn()
  createdAt: Date;
}
