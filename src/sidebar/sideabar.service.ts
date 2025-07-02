import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sidebar } from './sidebar.entity';
import { CreateSidebarDto, UpdateSidebarDto } from './sidebar.dto';

@Injectable()
export class SidebarService {
  constructor(
    @InjectRepository(Sidebar)
    private readonly sidebarRepository: Repository<Sidebar>,
  ) {}

  async create(createSidebarDto: CreateSidebarDto): Promise<Sidebar> {
    const { name, type, imgUrl, link } = createSidebarDto;

    const sidebar = this.sidebarRepository.create({
      name,
      type,
      imgUrl,
      link,
    });

    return this.sidebarRepository.save(sidebar);
  }

  async findAll(): Promise<Sidebar[]> {
    return this.sidebarRepository.find();
  }

  async update(
    id: number,
    updateSidebarDto: UpdateSidebarDto,
  ): Promise<Sidebar> {
    const sidebar = await this.sidebarRepository.findOneBy({ id });
    if (!sidebar) {
      throw new Error('Sidebar not found');
    }

    Object.assign(sidebar, updateSidebarDto);
    return this.sidebarRepository.save(sidebar);
  }

  async delete(id: number): Promise<void> {
    await this.sidebarRepository.delete(id);
  }
}
