import { Controller, Get, Post } from '@nestjs/common';
import { PageVisitService } from './pagevisit.service';

@Controller('pagevisit')
export class PageVisitController {
  constructor(private readonly service: PageVisitService) {}

  @Post('increment')
  async incrementVisit() {
    return await this.service.incrementVisit();
  }

  @Get('count')
  async getVisitCount() {
    return { visitCount: await this.service.getVisitCount() };
  }

  @Get('stats')
  async getVisitStats() {
    return await this.service.getVisitStats();
  }
}
