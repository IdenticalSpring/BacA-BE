import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Class } from './class.entity';
import { CreateClassDto, UpdateClassDto } from './class.dto';
import { Teacher } from 'src/teacher/teacher.entity';

@Injectable()
export class ClassService {
  constructor(
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
  ) {}

  async findAll(): Promise<Class[]> {
    return await this.classRepository.find({
      relations: ['teacher'],
    });
  }

  async findOne(id: number): Promise<Class> {
    const classEntity = await this.classRepository.findOne({
      where: { id },
      relations: ['teacher'],
    });
    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }
    return classEntity;
  }

  async create(createClassDto: CreateClassDto): Promise<Class> {
    const { teacherID, ...rest } = createClassDto;

    // Tìm teacher theo ID
    const teacher = await this.teacherRepository.findOne({
      where: { id: teacherID },
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${teacherID} not found`);
    }

    // Tạo class và gán teacher
    const classEntity = this.classRepository.create({
      ...rest,
      teacher, // Gán trực tiếp teacher vào entity
    });

    return await this.classRepository.save(classEntity);
  }

  async update(id: number, updateClassDto: UpdateClassDto): Promise<Class> {
    const { teacherID, ...rest } = updateClassDto;

    // Tìm class cần update
    const classEntity = await this.findOne(id);

    // Nếu có teacherId, tìm teacher tương ứng
    if (teacherID !== undefined) {
      const teacher = await this.teacherRepository.findOne({
        where: { id: teacherID },
      });

      if (!teacher) {
        throw new NotFoundException(`Teacher with ID ${teacherID} not found`);
      }

      classEntity.teacher = teacher;
    }

    // Cập nhật các field còn lại
    Object.assign(classEntity, rest);

    return await this.classRepository.save(classEntity);
  }

  async remove(id: number): Promise<void> {
    const result = await this.classRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }
  }
}
