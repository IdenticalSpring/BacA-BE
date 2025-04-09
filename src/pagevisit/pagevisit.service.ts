import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PageVisit } from './pagevisit.entity';
import { format } from 'date-fns'; // Thư viện để xử lý ngày tháng

@Injectable()
export class PageVisitService {
  constructor(
    @InjectRepository(PageVisit)
    private readonly repository: Repository<PageVisit>,
  ) {}

  async incrementVisit(): Promise<PageVisit> {
    const today = format(new Date(), 'yyyy-MM-dd'); // Lấy ngày hiện tại
    let record = await this.repository.findOne({ where: { date: today } });
    if (!record) {
      record = this.repository.create({ date: today, visitCount: 1 });
    } else {
      record.visitCount++;
    }
    return await this.repository.save(record);
  }

  async getVisitCount(): Promise<number> {
    const today = format(new Date(), 'yyyy-MM-dd');
    const record = await this.repository.findOne({ where: { date: today } });
    return record ? record.visitCount : 0;
  }

  async getVisitStats(): Promise<PageVisit[]> {
    return await this.repository.find({ order: { date: 'DESC' } });
  }
}
