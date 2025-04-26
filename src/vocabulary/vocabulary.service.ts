import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as dotenv from 'dotenv';
import { Vocabulary } from './vocabulary.entity';
import { HomeWork } from 'src/homeWork/homeWork.entity';
import {
  CreateVocabularyDto,
  FindByStudentAndHomework,
  UpdateVocabularyDto,
} from './vocabulary.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { Student } from 'src/student/student.entity';
dotenv.config();
@Injectable()
export class VocabularyService {
  constructor(
    @InjectRepository(Vocabulary)
    private readonly vocabularyRepository: Repository<Vocabulary>,
    @InjectRepository(HomeWork)
    private readonly homeworkRepository: Repository<HomeWork>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
  ) {}

  async findAll(): Promise<Vocabulary[]> {
    return await this.vocabularyRepository.find({
      where: { isDelete: false, student: null },
      relations: ['homework', 'student'],
    });
  }
  async findVocabularyByHomeworkId(homeworkId: number): Promise<Vocabulary[]> {
    const homework = await this.homeworkRepository.findOne({
      where: { id: homeworkId, isDelete: false },
    });
    if (!homework) {
      throw new NotFoundException(`homework with ID ${homeworkId} not found`);
    }
    return await this.vocabularyRepository.find({
      where: {
        homework,
        isDelete: false,
        student: null,
      },
      relations: ['homework', 'student'],
    });
  }
  async findOne(id: number): Promise<Vocabulary> {
    const vocabulary = await this.vocabularyRepository.findOne({
      where: { id, isDelete: false, student: null },
      relations: ['homework', 'student'],
    });
    if (!vocabulary) {
      throw new NotFoundException(`Vocabulary with ID ${id} not found`);
    }
    return vocabulary;
  }
  async findAllForStudent(): Promise<Vocabulary[]> {
    return await this.vocabularyRepository.find({
      where: { isDelete: false },
      relations: ['homework', 'student'],
    });
  }
  async findVocabularyByHomeworkIdForStudent(
    homeworkId: number,
  ): Promise<Vocabulary[]> {
    const homework = await this.homeworkRepository.findOne({
      where: { id: homeworkId, isDelete: false },
    });
    if (!homework) {
      throw new NotFoundException(`homework with ID ${homeworkId} not found`);
    }
    return await this.vocabularyRepository.find({
      where: {
        homework,
        isDelete: false,
      },
      relations: ['homework', 'student'],
    });
  }
  async findVocabularyByHomeworkIdAndStudentIdForStudent(
    findByStudentAndHomework: FindByStudentAndHomework,
  ): Promise<Vocabulary[]> {
    const { homeworkId, studentId } = findByStudentAndHomework;

    const homework = await this.homeworkRepository.findOne({
      where: { id: homeworkId, isDelete: false },
    });
    if (!homework) {
      throw new NotFoundException(`homework with ID ${homeworkId} not found`);
    }
    const student = await this.studentRepository.findOne({
      where: { id: studentId, isDelete: false },
    });
    if (!student) {
      throw new NotFoundException(`student with ID ${studentId} not found`);
    }
    // console.log(homework, student);
    return await this.vocabularyRepository.find({
      where: {
        homework,
        student,
        isDelete: false,
      },
      relations: ['homework', 'student'],
    });
  }
  async findOneForStudent(id: number): Promise<Vocabulary> {
    const vocabulary = await this.vocabularyRepository.findOne({
      where: { id, isDelete: false },
      relations: ['homework', 'student'],
    });
    if (!vocabulary) {
      throw new NotFoundException(`Vocabulary with ID ${id} not found`);
    }
    return vocabulary;
  }

  async create(
    createVocabularyDto: CreateVocabularyDto,
    mp3File?: Express.Multer.File,
  ): Promise<Vocabulary> {
    const { homeworkId, studentId, ...rest } = createVocabularyDto;
    if (createVocabularyDto?.imageUrl === 'undefined') {
      createVocabularyDto.imageUrl = null;
    }
    // Tìm teacher theo ID
    const homework = await this.homeworkRepository.findOne({
      where: { id: homeworkId, isDelete: false },
    });

    if (!homework) {
      throw new NotFoundException(`Teacher with ID ${homeworkId} not found`);
    }
    let student = null;
    if (studentId) {
      student = await this.studentRepository.findOne({
        where: { id: studentId, isDelete: false },
      });

      if (!student) {
        throw new NotFoundException(`Teacher with ID ${studentId} not found`);
      }
    }
    let mp3Url: string | null = null;
    if (mp3File) {
      console.log('Uploading MP3 file...');
      mp3Url = await CloudinaryService.uploadBuffer(mp3File.buffer);
      console.log('MP3 uploaded:', mp3Url);
    }
    const vocabularyEntity = this.vocabularyRepository.create({
      ...rest,
      audioUrl: mp3Url || null,
      homework,
      student,
    });

    return await this.vocabularyRepository.save(vocabularyEntity);
  }
  async bulkCreateWithFiles(
    dtos: CreateVocabularyDto[],
    mp3Files: Express.Multer.File[],
  ): Promise<Vocabulary[]> {
    // console.log(dtos, mp3Files);

    return await Promise.all(
      dtos.map(async (dto, index) => {
        const { homeworkId, studentId, ...rest } = dto;
        if (dto?.imageUrl === 'undefined') {
          dto.imageUrl = null;
        }
        const homework = await this.homeworkRepository.findOne({
          where: { id: homeworkId, isDelete: false },
        });

        if (!homework) {
          throw new NotFoundException(
            `Teacher with ID ${homeworkId} not found`,
          );
        }
        // Tìm teacher theo ID
        let student = null;
        if (studentId) {
          student = await this.studentRepository.findOne({
            where: { id: studentId, isDelete: false },
          });

          if (!student) {
            throw new NotFoundException(
              `Teacher with ID ${studentId} not found`,
            );
          }
        }
        let mp3Url: string | null = null;
        if (mp3Files[index] && mp3Files[index].size > 0) {
          console.log('Uploading MP3 file...');
          mp3Url = await CloudinaryService.uploadBuffer(mp3Files[index].buffer);
          console.log('MP3 uploaded:', mp3Url);
        }
        const vocabularyEntity = this.vocabularyRepository.create({
          ...rest,
          audioUrl: mp3Url || null,
          homework,
          student,
        });

        return await this.vocabularyRepository.save(vocabularyEntity);
      }),
    );
  }

  async update(
    id: number,
    updateVocabularyDto: UpdateVocabularyDto,
    mp3File?: Express.Multer.File,
  ): Promise<Vocabulary> {
    const { homeworkId, studentId, ...rest } = updateVocabularyDto;
    // Tìm class cần update
    const vocabularyEntity = await this.findOne(id);
    if (!vocabularyEntity) {
      throw new NotFoundException(`Vocabulary with ID ${id} not found`);
    }
    if (updateVocabularyDto?.imageUrl === 'undefined') {
      updateVocabularyDto.imageUrl = vocabularyEntity.imageUrl;
    }
    if (homeworkId !== undefined) {
      const homework = await this.homeworkRepository.findOne({
        where: { id: homeworkId, isDelete: false },
      });

      if (!homework) {
        throw new NotFoundException(`Homework with ID ${homeworkId} not found`);
      }

      vocabularyEntity.homework = homework;
    }
    if (studentId) {
      const student = await this.studentRepository.findOne({
        where: { id: studentId, isDelete: false },
      });

      if (!student) {
        throw new NotFoundException(`Teacher with ID ${studentId} not found`);
      }
      vocabularyEntity.student = student;
    }
    let mp3Url: string | null = null;
    if (mp3File) {
      console.log('Uploading MP3 file...');
      mp3Url = await CloudinaryService.uploadBuffer(mp3File.buffer);
      console.log('MP3 uploaded:', mp3Url);
    }
    if (mp3Url) {
      vocabularyEntity.audioUrl = mp3Url;
    }
    // Cập nhật các field còn lại
    Object.assign(vocabularyEntity, rest);

    return await this.vocabularyRepository.save(vocabularyEntity);
  }
  async remove(id: number): Promise<void> {
    // const result = await this.homeWorkRepository.delete(id);
    // if (result.affected === 0) {
    //   throw new NotFoundException(`HomeWork with ID ${id} not found`);
    // }
    const vocabulary = await this.vocabularyRepository.findOne({
      where: { id, isDelete: false },
    });
    if (!vocabulary) {
      throw new NotFoundException(`Vocabulary with ID ${id} not found`);
    }
    vocabulary.isDelete = true;
    await this.vocabularyRepository.save(vocabulary);
  }
}
