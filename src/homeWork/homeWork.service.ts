import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HomeWork } from './homeWork.entity';
import {
  CreateHomeWorkDto,
  findHomeWorkByLevelAndTeacherIdDto,
  UpdateHomeWorkDto,
} from './homeWork.dto';
import * as dotenv from 'dotenv';
import { Teacher } from 'src/teacher/teacher.entity';
import * as PlayHT from 'playht';
import fs from 'fs';
PlayHT.init({
  userId: process.env.PLAYHT_USERID,
  apiKey: process.env.PLAYHT_SECRETKEY,
});
async function streamAudio(text: string) {
  const stream = await PlayHT.stream(
    'All human wisdom is summed up in these two words: Wait and hope.',
    { voiceEngine: 'PlayDialog' },
  );
  stream.on('data', (chunk) => {
    // Do whatever you want with the stream, you could save it to a file, stream it in realtime to the browser or app, or to a telephony system
    fs.appendFileSync('output.mp3', chunk);
  });
  return stream;
}
dotenv.config();
@Injectable()
export class HomeWorkService {
  constructor(
    @InjectRepository(HomeWork)
    private readonly homeWorkRepository: Repository<HomeWork>,
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
  ) {}

  async findAll(): Promise<HomeWork[]> {
    streamAudio('sss');
    return await this.homeWorkRepository.find({
      where: { isDelete: false },
      relations: ['teacher'],
    });
  }
  async findHomeWorkByLevelAndTeacherId(
    findHomeWorkByLevelAndTeacherId: findHomeWorkByLevelAndTeacherIdDto,
  ): Promise<HomeWork[]> {
    const teacher = await this.teacherRepository.find({
      where: { id: findHomeWorkByLevelAndTeacherId.teacherId },
    });
    return await this.homeWorkRepository.find({
      where: {
        level: findHomeWorkByLevelAndTeacherId.level,
        teacher,
        isDelete: false,
      },
      relations: ['teacher'],
    });
  }
  async findHomeWorkByTeacherId(teacherId: number): Promise<HomeWork[]> {
    const teacher = await this.teacherRepository.find({
      where: { id: teacherId },
    });
    return await this.homeWorkRepository.find({
      where: {
        teacher,
        isDelete: false,
      },
      relations: ['teacher'],
    });
  }
  async findOne(id: number): Promise<HomeWork> {
    const homeWork = await this.homeWorkRepository.findOne({
      where: { id, isDelete: false },
      relations: ['teacher'],
    });
    if (!homeWork) {
      throw new NotFoundException(`HomeWork with ID ${id} not found`);
    }
    return homeWork;
  }

  async create(createHomeWorkDto: CreateHomeWorkDto): Promise<HomeWork> {
    const { teacherId, textToSpeech, ...rest } = createHomeWorkDto;

    // Tìm teacher theo ID
    const teacher = await this.teacherRepository.findOne({
      where: { id: teacherId, isDelete: false },
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${teacherId} not found`);
    }

    // Tạo class và gán teacher
    const homeWorkEntity = this.homeWorkRepository.create({
      ...rest,
      teacher, // Gán trực tiếp teacher vào entity
    });

    return await this.homeWorkRepository.save(homeWorkEntity);
  }

  async update(
    id: number,
    updateHomeWorkDto: UpdateHomeWorkDto,
  ): Promise<HomeWork> {
    const { teacherId, ...rest } = updateHomeWorkDto;
    // Tìm class cần update
    const homeWorkEntity = await this.findOne(id);
    if (!homeWorkEntity) {
      throw new NotFoundException(`HomeWork with ID ${id} not found`);
    }
    if (teacherId !== undefined) {
      const teacher = await this.teacherRepository.findOne({
        where: { id: teacherId },
      });

      if (!teacher) {
        throw new NotFoundException(`Teacher with ID ${teacherId} not found`);
      }

      homeWorkEntity.teacher = teacher;
    }

    // Cập nhật các field còn lại
    Object.assign(homeWorkEntity, rest);

    return await this.homeWorkRepository.save(homeWorkEntity);
  }

  async remove(id: number): Promise<void> {
    // const result = await this.homeWorkRepository.delete(id);
    // if (result.affected === 0) {
    //   throw new NotFoundException(`HomeWork with ID ${id} not found`);
    // }
    const homeWork = await this.homeWorkRepository.findOne({
      where: { id, isDelete: false },
    });
    if (!homeWork) {
      throw new NotFoundException(`HomeWork with ID ${id} not found`);
    }
    homeWork.isDelete = true;
    await this.homeWorkRepository.save(homeWork);
  }
}
