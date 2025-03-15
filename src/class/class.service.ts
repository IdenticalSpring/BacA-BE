import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { Class } from './class.entity';
import { CreateClassDto, UpdateClassDto } from './class.dto';
import { Teacher } from 'src/teacher/teacher.entity';
import { LessonBySchedule } from 'src/lesson_by_schedule/lesson_by_schedule.entity';

@Injectable()
export class ClassService {
  constructor(
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
    @InjectRepository(LessonBySchedule)
    private readonly lessonByScheduleRepository: Repository<LessonBySchedule>,
  ) {}

  async findAll(): Promise<Class[]> {
    return await this.classRepository.find({
      relations: ['teacher'],
      where: { isDelete: false },
    });
  }

  async findOne(id: number): Promise<Class> {
    const classEntity = await this.classRepository.findOne({
      where: { id, isDelete: false },
      relations: ['teacher'],
    });
    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }
    return classEntity;
  }

  async findByTeacher(teacherID: number): Promise<Class[]> {
    const teacher = await this.teacherRepository.findOne({
      where: { id: teacherID },
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${teacherID} not found`);
    }

    return await this.classRepository.find({
      where: { teacher: { id: teacherID } },
      relations: ['teacher'],
    });
  }

  async create(createClassDto: CreateClassDto): Promise<Class> {
    const { teacherID, ...rest } = createClassDto;

    // Tìm teacher theo ID
    const teacher = await this.teacherRepository.findOne({
      where: { id: teacherID, isDelete: false },
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
    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }
    // Kiểm tra xem có lesson nào thuộc classId có ngày < hiện tại không
    const outdatedLessons = await this.lessonByScheduleRepository.find({
      where: {
        class: classEntity,
        date: LessThan(new Date()), // Chỉ lấy những bài học có ngày nhỏ hơn hiện tại
      },
    });

    // Nếu có ít nhất một lesson không hợp lệ, ngăn chặn cập nhật
    if (outdatedLessons.length > 0) {
      throw new BadRequestException(
        `Cannot update class because some lessons in this class have already taken place.`,
      );
    }

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
    // const result = await this.classRepository.delete(id);
    // if (result.affected === 0) {
    //   throw new NotFoundException(`Class with ID ${id} not found`);
    // }
    const Class = await this.classRepository.findOne({
      where: { id, isDelete: false },
    });
    if (!Class) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }
    Class.isDelete = true;
    await this.classRepository.save(Class);
  }
}
