import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('presentation_assets')
export class PresentationAsset {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  presentationId: number;

  @Column({ length: 30, default: 'image' })
  assetType: string;

  @Column({ type: 'text', nullable: false })
  url: string;

  @Column({ type: 'text', nullable: true })
  originalName: string;

  @Column({ length: 120, nullable: true })
  mimeType: string;

  @Column({ type: 'int', nullable: true })
  size: number;

  @Column({ type: 'longtext', nullable: true })
  metadataJson: string;

  @CreateDateColumn()
  createdAt: Date;
}
