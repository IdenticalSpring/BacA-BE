import { Entity, PrimaryColumn } from 'typeorm';

@Entity('presentation_tags')
export class PresentationTag {
  @PrimaryColumn({ type: 'int' })
  presentationId: number;

  @PrimaryColumn({ type: 'int' })
  tagId: number;
}
