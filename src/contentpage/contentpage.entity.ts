import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('content_page')
export class ContentPage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, nullable: true })
  homepageMainTitle: string;

  @Column({ type: 'text', nullable: true })
  homepageDescription: string;

  @Column({ length: 255, nullable: true })
  featureMainTitle: string;

  @Column({ type: 'text', nullable: true })
  featureMainDescription: string;

  @Column({ length: 255, nullable: true })
  featureFirstTitle: string;

  @Column({ type: 'text', nullable: true })
  featureFristDescription: string;

  @Column({ length: 255, nullable: true })
  featureSecondTitle: string;

  @Column({ type: 'text', nullable: true })
  featureSecondDescription: string;

  @Column({ length: 255, nullable: true })
  featureThirdTitle: string;

  @Column({ type: 'text', nullable: true })
  featureThirdDescription: string;

  @Column({ length: 255, nullable: true })
  featureFourthTitle: string;

  @Column({ type: 'text', nullable: true })
  featureFourthDescription: string;

  @Column({ length: 255, nullable: true })
  featureFivethTitle: string;

  @Column({ type: 'text', nullable: true })
  featureFivethDescription: string;

  @Column({ length: 255, nullable: true })
  featureSixthTitle: string;

  @Column({ type: 'text', nullable: true })
  featureSixthDescription: string;

  @Column({ length: 255, nullable: true })
  worksMainTitle: string;

  @Column({ type: 'text', nullable: true })
  worksMainDescription: string;

  @Column({ length: 255, nullable: true })
  worksFirstTitle: string;

  @Column({ type: 'text', nullable: true })
  worksFristDescription: string;

  @Column({ length: 255, nullable: true })
  worksSecondTitle: string;

  @Column({ type: 'text', nullable: true })
  worksSecondDescription: string;

  @Column({ length: 255, nullable: true })
  worksThirdTitle: string;

  @Column({ type: 'text', nullable: true })
  worksThirdDescription: string;

  @Column({ length: 255, nullable: true })
  worksFourthTitle: string;

  @Column({ type: 'text', nullable: true })
  worksFourthDescription: string;

  @Column({ length: 255, nullable: true })
  testimonialsMainTitle: string;

  @Column({ type: 'text', nullable: true })
  testimonialsMainDescription: string;

  @Column({ length: 255, nullable: true })
  testimonialsFirstTitle: string;

  @Column({ type: 'text', nullable: true })
  testimonialsFristDescription: string;

  @Column({ length: 255, nullable: true })
  testimonialsSecondTitle: string;

  @Column({ type: 'text', nullable: true })
  testimonialsSecondDescription: string;

  @Column({ length: 255, nullable: true })
  testimonialsThirdTitle: string;

  @Column({ type: 'text', nullable: true })
  testimonialsThirdDescription: string;

  @Column({ type: 'text', nullable: true })
  footerDescription: string;

  @Column({ type: 'text', nullable: true })
  footerAddress: string;

  @Column({ type: 'text', nullable: true })
  footerEmail: string;

  @Column({ type: 'text', nullable: true })
  footerContact: string;

  @Column({ length: 255, nullable: true })
  linkFacebook: string;

  @Column({ length: 255, nullable: true })
  linkZalo: string;

  @Column({ length: 255, nullable: true })
  linkYoutube: string;

  @Column({ length: 255, nullable: true })
  name: string;
  @Column({ length: 255, nullable: true })
  adsenseId: string;

  // Thêm hai trường mới
  @Column({ type: 'text', nullable: true })
  promptDescription: string;

  @Column({ type: 'text', nullable: true })
  promptLessonPlan: string;
}
