import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateContentPageDto, UpdateContentPageDto } from './contentpage.dto';
import { ContentPage } from './contentpage.entity';

@Injectable()
export class ContentPageService {
  constructor(
    @InjectRepository(ContentPage)
    private readonly contentPageRepository: Repository<ContentPage>,
  ) {}

  async create(
    createContentPageDto: CreateContentPageDto,
  ): Promise<ContentPage> {
    const contentPage = this.contentPageRepository.create(createContentPageDto);
    return this.contentPageRepository.save(contentPage);
  }

  async findAll(): Promise<ContentPage[]> {
    return this.contentPageRepository.find();
  }

  async findOne(id: number): Promise<ContentPage> {
    const contentPage = await this.contentPageRepository.findOne({
      where: { id },
    });
    if (!contentPage) {
      throw new NotFoundException(`ContentPage with ID ${id} not found`);
    }
    return contentPage;
  }

  async update(
    id: number,
    updateContentPageDto: UpdateContentPageDto,
  ): Promise<ContentPage> {
    const contentPage = await this.findOne(id);
    Object.assign(contentPage, updateContentPageDto);
    return this.contentPageRepository.save(contentPage);
  }

  async remove(id: number): Promise<void> {
    const contentPage = await this.findOne(id);
    await this.contentPageRepository.remove(contentPage);
  }
}
