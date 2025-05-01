import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HomeWork } from './homeWork.entity';
import {
  CreateHomeWorkDto,
  findHomeWorkByLevelAndTeacherIdDto,
  textToSpeechDto,
  UpdateHomeWorkDto,
} from './homeWork.dto';
import * as dotenv from 'dotenv';
import { Teacher } from 'src/teacher/teacher.entity';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import axios from 'axios';
import { LessonBySchedule } from 'src/lesson_by_schedule/lesson_by_schedule.entity';
dotenv.config();
@Injectable()
export class HomeWorkService {
  constructor(
    @InjectRepository(HomeWork)
    private readonly homeWorkRepository: Repository<HomeWork>,
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
    @InjectRepository(LessonBySchedule)
    private readonly lessonByScheduleRepository: Repository<LessonBySchedule>,
  ) {}

  async findAll(): Promise<HomeWork[]> {
    return await this.homeWorkRepository.find({
      where: { isDelete: false },
      relations: ['teacher', 'vocabularies'],
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
      relations: ['teacher', 'vocabularies'],
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
      relations: ['teacher', 'vocabularies'],
    });
  }
  async findOne(id: number): Promise<HomeWork> {
    const homeWork = await this.homeWorkRepository.findOne({
      where: { id, isDelete: false },
      relations: ['teacher', 'vocabularies'],
    });
    if (!homeWork) {
      throw new NotFoundException(`HomeWork with ID ${id} not found`);
    }
    return homeWork;
  }

  async create(createHomeWorkDto: CreateHomeWorkDto): Promise<HomeWork> {
    const { teacherId, ...rest } = createHomeWorkDto;
    // console.log('createHomeWorkDto', createHomeWorkDto);

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
    const lessonBySchedule = await this.lessonByScheduleRepository.find({
      where: { homeWorkId: homeWork.id },
    });
    if (lessonBySchedule.length > 0) {
      // console.log('lessonBySchedule', lessonBySchedule);
      const data = await Promise.all(
        lessonBySchedule.map((lesson) => {
          lesson.homeWorkId = null;
          lesson.isHomeWorkSent = false;
          return lesson;
        }),
      );
      await this.lessonByScheduleRepository.save(data);
    }
    homeWork.isDelete = true;
    await this.homeWorkRepository.save(homeWork);
  }
  // async textToSpeech(textToSpeechDto: textToSpeechDto): Promise<string> {
  //   try {
  //     const response = await axios.post(
  //       'https://ttsfree.com/api/v1/tts',
  //       {
  //         text: textToSpeechDto.textToSpeech,
  //         voiceService: 'servicebin',
  //         voiceID: textToSpeechDto.gender ? 'en-US4' : 'en-US',
  //         voiceSpeed: '0',
  //       },
  //       {
  //         headers: {
  //           'Content-Type': 'application/json',
  //           apikey: process.env.API_TTS_KEY,
  //         },
  //       },
  //     );
  //     console.log(response.data);

  //     return response.data.audioData; // Trả về buffer
  //   } catch (error) {
  //     console.error('Error converting text to speech:', error);
  //     throw new Error('TTS conversion failed');
  //   }
  // }
  async textToSpeech(textToSpeechDto: textToSpeechDto): Promise<string> {
    try {
      const response = await axios.post(
        'http://82.25.110.152:5000/tts',
        {
          text: textToSpeechDto.textToSpeech,
          voice: textToSpeechDto.voice ?? 'af_heart',
          voiceSpeed: textToSpeechDto.voiceSpeed ?? '0.8',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            // apikey: process.env.API_TTS_KEY,
          },
        },
      );
      console.log(response.data);

      return response.data.audioData; // Trả về buffer
    } catch (error) {
      console.error(
        'Error converting text to speech:',
        error?.response?.data?.message,
      );
      throw new Error(
        'TTS conversion failed ' + error?.response?.data?.message,
      );
    }
  }
  async voices(): Promise<any> {
    try {
      const response = await axios.get('http://82.25.110.152:5000/voices');
      console.log(response.data);

      return response.data.voices; // Trả về buffer
    } catch (error) {
      console.error('Get voices TTS failed ', error?.response?.data?.message);
      throw new Error(
        'Get voices TTS failed ' + error?.response?.data?.message,
      );
    }
  }
}
