import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from './question.entity';
import { CreateQuestionDto, UpdateQuestionDto } from './question.dto';
import { Teacher } from '../teacher/teacher.entity';
import { Class } from '../class/class.entity';
import { HomeWork } from '../homeWork/homeWork.entity'; // Thêm dòng này

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
    @InjectRepository(HomeWork)
    private readonly homeWorkRepository: Repository<HomeWork>, // Thêm dòng này
  ) {}

  async create(dto: CreateQuestionDto): Promise<Question> {
    const teacher = await this.teacherRepository.findOneBy({
      id: dto.teacherID,
    });
    const classEntity = await this.classRepository.findOneBy({
      id: dto.classID,
    });
    let homeWork = null;
    if (dto.homeWorkId) {
      homeWork = await this.homeWorkRepository.findOneBy({
        id: dto.homeWorkId,
      });
    }
    const question = this.questionRepository.create({
      teacher,
      class: classEntity,
      homeWork, // Thêm dòng này
      text: dto.text,
      imageUrl: dto.imageUrl || '',
    });
    return this.questionRepository.save(question);
  }

  async findAll(): Promise<Question[]> {
    return this.questionRepository.find();
  }

  async findOne(id: number): Promise<Question> {
    return this.questionRepository.findOneBy({ id });
  }

  async update(id: number, dto: UpdateQuestionDto): Promise<Question> {
    const updateData: any = { ...dto };
    if (dto.homeWorkId) {
      const homeWork = await this.homeWorkRepository.findOneBy({
        id: dto.homeWorkId,
      });
      updateData.homeWork = homeWork;
    }
    await this.questionRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.questionRepository.delete(id);
  }

  async findByHomeWorkId(homeWorkId: number): Promise<Question[]> {
    return this.questionRepository.find({
      where: { homeWork: { id: homeWorkId } },
    });
  }
}
