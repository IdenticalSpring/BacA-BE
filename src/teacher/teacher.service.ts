import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Teacher } from './teacher.entity';
import { CreateTeacherDto, UpdateTeacherDto } from './teacher.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class TeacherService {
  constructor(
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
  ) {}

  async findAll(): Promise<Teacher[]> {
    return await this.teacherRepository.find({ where: { isDelete: false } });
  }

  async findOne(id: number): Promise<Teacher> {
    const teacher = await this.teacherRepository.findOne({
      where: { id, isDelete: false },
    });
    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    }
    return teacher;
  }

  async create(
    createTeacherDto: CreateTeacherDto,
    files: Express.Multer.File[],
  ): Promise<Teacher> {
    let fileUrls: string[] = [];
    if (files && files.length > 0) {
      const buffers = files.map((file) => file.buffer);
      fileUrls = await CloudinaryService.uploadMultipleBuffers(buffers);
    }

    const teacher = this.teacherRepository.create({
      ...createTeacherDto,
      fileUrl: fileUrls.join(','), // Lưu danh sách URL dưới dạng chuỗi
    });
    return await this.teacherRepository.save(teacher);
  }

  async update(
    id: number,
    updateTeacherDto: UpdateTeacherDto,
    files?: Express.Multer.File[],
  ): Promise<Teacher> {
    const teacher = await this.findOne(id);

    if (files && files.length > 0) {
      const buffers = files.map((file) => file.buffer);
      const fileUrls = await CloudinaryService.uploadMultipleBuffers(buffers);
      updateTeacherDto.fileUrl = fileUrls.join(','); // Lưu danh sách URL dưới dạng chuỗi
    }

    Object.assign(teacher, updateTeacherDto);
    return await this.teacherRepository.save(teacher);
  }

  async remove(id: number): Promise<void> {
    const teacher = await this.teacherRepository.findOne({
      where: { id, isDelete: false },
    });
    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    }
    teacher.isDelete = true;
    await this.teacherRepository.save(teacher);
  }
}
