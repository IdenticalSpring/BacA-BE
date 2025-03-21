import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { Level } from './level.entity';
import { CreateLevelDto, UpdateLevelDto } from './level.dto';

@Injectable()
export class LevelService {
  constructor(
    @InjectRepository(Level)
    private readonly levelRepository: Repository<Level>,
  ) {}

  async findAll(): Promise<Level[]> {
    return await this.levelRepository.find({
      where: { isDelete: false },
    });
  }

  async findOne(id: number): Promise<Level> {
    const levelEntity = await this.levelRepository.findOne({
      where: { id, isDelete: false },
    });
    if (!levelEntity) {
      throw new NotFoundException(`Level with ID ${id} not found`);
    }
    return levelEntity;
  }
  async create(createLevelDto: CreateLevelDto): Promise<Level> {
    // Tạo class và gán teacher
    const levelEntity = this.levelRepository.create(createLevelDto);

    return await this.levelRepository.save(levelEntity);
  }

  async update(id: number, updateLevelDto: UpdateLevelDto): Promise<Level> {
    // Tìm class cần update
    const levelEntity = await this.findOne(id);
    if (!levelEntity) {
      throw new NotFoundException(`Level with ID ${id} not found`);
    }

    Object.assign(levelEntity, updateLevelDto);

    return await this.levelRepository.save(levelEntity);
  }

  async remove(id: number): Promise<void> {
    // const result = await this.classRepository.delete(id);
    // if (result.affected === 0) {
    //   throw new NotFoundException(`Class with ID ${id} not found`);
    // }
    const Level = await this.levelRepository.findOne({
      where: { id, isDelete: false },
    });
    if (!Level) {
      throw new NotFoundException(`Level with ID ${id} not found`);
    }
    Level.isDelete = true;
    await this.levelRepository.save(Level);
  }
}
