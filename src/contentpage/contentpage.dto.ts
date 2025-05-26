import { IsString, IsOptional } from 'class-validator';

export class CreateContentPageDto {
  @IsOptional()
  @IsString()
  homepageMainTitle?: string;

  @IsOptional()
  @IsString()
  homepageDescription?: string;

  @IsOptional()
  @IsString()
  featureMainTitle?: string;

  @IsOptional()
  @IsString()
  featureMainDescription?: string;

  @IsOptional()
  @IsString()
  featureFirstTitle?: string;

  @IsOptional()
  @IsString()
  featureFristDescription?: string;

  @IsOptional()
  @IsString()
  featureSecondTitle?: string;

  @IsOptional()
  @IsString()
  featureSecondDescription?: string;

  @IsOptional()
  @IsString()
  featureThirdTitle?: string;

  @IsOptional()
  @IsString()
  featureThirdDescription?: string;

  @IsOptional()
  @IsString()
  featureFourthTitle?: string;

  @IsOptional()
  @IsString()
  featureFourthDescription?: string;

  @IsOptional()
  @IsString()
  featureFivethTitle?: string;

  @IsOptional()
  @IsString()
  featureFivethDescription?: string;

  @IsOptional()
  @IsString()
  featureSixthTitle?: string;

  @IsOptional()
  @IsString()
  featureSixthDescription?: string;

  @IsOptional()
  @IsString()
  worksMainTitle?: string;

  @IsOptional()
  @IsString()
  worksMainDescription?: string;

  @IsOptional()
  @IsString()
  worksFirstTitle?: string;

  @IsOptional()
  @IsString()
  worksFristDescription?: string;

  @IsOptional()
  @IsString()
  worksSecondTitle?: string;

  @IsOptional()
  @IsString()
  worksSecondDescription?: string;

  @IsOptional()
  @IsString()
  worksThirdTitle?: string;

  @IsOptional()
  @IsString()
  worksThirdDescription?: string;

  @IsOptional()
  @IsString()
  worksFourthTitle?: string;

  @IsOptional()
  @IsString()
  worksFourthDescription?: string;

  @IsOptional()
  @IsString()
  testimonialsMainTitle?: string;

  @IsOptional()
  @IsString()
  testimonialsMainDescription?: string;

  @IsOptional()
  @IsString()
  testimonialsFirstTitle?: string;

  @IsOptional()
  @IsString()
  testimonialsFristDescription?: string;

  @IsOptional()
  @IsString()
  testimonialsSecondTitle?: string;

  @IsOptional()
  @IsString()
  testimonialsSecondDescription?: string;

  @IsOptional()
  @IsString()
  testimonialsThirdTitle?: string;

  @IsOptional()
  @IsString()
  testimonialsThirdDescription?: string;

  @IsOptional()
  @IsString()
  testimonialsFirstImgUrl?: string;

  @IsOptional()
  @IsString()
  testimonialsSecondImgUrl?: string;

  @IsOptional()
  @IsString()
  testimonialsThirdImgUrl?: string;

  @IsOptional()
  @IsString()
  footerDescription?: string;

  @IsOptional()
  @IsString()
  footerAddress?: string;

  @IsOptional()
  @IsString()
  footerEmail?: string;

  @IsOptional()
  @IsString()
  footerContact?: string;

  @IsOptional()
  @IsString()
  linkFacebook?: string;

  @IsOptional()
  @IsString()
  linkZalo?: string;

  @IsOptional()
  @IsString()
  img1?: string;

  @IsOptional()
  @IsString()
  linkYoutube?: string;

  @IsOptional()
  @IsString()
  img2?: string;

  @IsOptional()
  @IsString()
  name?: string;
  @IsOptional()
  @IsString()
  adsenseId?: string;

  @IsOptional()
  @IsString()
  promptDescription?: string;

  @IsOptional()
  @IsString()
  promptLessonPlan?: string;
  @IsOptional()
  @IsString()
  centerZaloLink?: string;

  @IsOptional()
  @IsString()
  linkTeacherSignUp?: string;
}

export class UpdateContentPageDto extends CreateContentPageDto {}
