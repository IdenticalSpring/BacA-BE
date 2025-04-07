import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PageVisit } from './pagevisit.entity';
import { PageVisitService } from './pagevisit.service';
import { PageVisitController } from './pagevisit.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PageVisit])],
  controllers: [PageVisitController],
  providers: [PageVisitService],
})
export class PageVisitModule {}
