import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PageVisit } from './pagevisit.entity';

@Injectable()
export class PageVisitService {
  constructor(
    @InjectRepository(PageVisit)
    private readonly repository: Repository<PageVisit>,
  ) {}

  async incrementVisit(): Promise<PageVisit> {
    let record = await this.repository.findOne({ where: { id: 1 } });
    if (!record) {
      record = this.repository.create({ visitCount: 1 });
    } else {
      record.visitCount++;
      record.lastVisit = new Date();
    }
    return await this.repository.save(record);
  }

  async getVisitCount(): Promise<number> {
    const record = await this.repository.findOne({ where: { id: 1 } });
    return record ? record.visitCount : 0;
  }
}
