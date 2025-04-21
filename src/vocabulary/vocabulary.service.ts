import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as dotenv from 'dotenv';
import { Vocabulary } from './vocabulary.entity';
import { HomeWork } from 'src/homeWork/homeWork.entity';
import { CreateVocabularyDto, UpdateVocabularyDto } from './vocabulary.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
dotenv.config();
@Injectable()
export class VocabularyService {
  constructor(
    @InjectRepository(Vocabulary)
    private readonly vocabularyRepository: Repository<Vocabulary>,
    @InjectRepository(HomeWork)
    private readonly homeworkRepository: Repository<HomeWork>,
  ) {}

  async findAll(): Promise<Vocabulary[]> {
    return await this.vocabularyRepository.find({
      where: { isDelete: false },
      relations: ['homework'],
    });
  }
  async findVocabularyByHomeworkId(homeworkId: number): Promise<Vocabulary[]> {
    const homework = await this.homeworkRepository.find({
      where: { id: homeworkId },
    });
    return await this.vocabularyRepository.find({
      where: {
        homework,
        isDelete: false,
      },
      relations: ['homework'],
    });
  }
  async findOne(id: number): Promise<Vocabulary> {
    const vocabulary = await this.vocabularyRepository.findOne({
      where: { id, isDelete: false },
      relations: ['homework'],
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
    const { homeworkId, ...rest } = createVocabularyDto;

    // Tìm teacher theo ID
    const homework = await this.homeworkRepository.findOne({
      where: { id: homeworkId, isDelete: false },
    });

    if (!homework) {
      throw new NotFoundException(`Teacher with ID ${homeworkId} not found`);
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
        const { homeworkId, ...rest } = dto;
        const homework = await this.homeworkRepository.findOne({
          where: { id: homeworkId, isDelete: false },
        });

        if (!homework) {
          throw new NotFoundException(
            `Teacher with ID ${homeworkId} not found`,
          );
        }
        // Tìm teacher theo ID

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
    const { homeworkId, ...rest } = updateVocabularyDto;
    // Tìm class cần update
    const vocabularyEntity = await this.findOne(id);
    if (!vocabularyEntity) {
      throw new NotFoundException(`Vocabulary with ID ${id} not found`);
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
