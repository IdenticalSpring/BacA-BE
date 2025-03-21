import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lesson } from './lesson.entity';
import {
  CreateLessonDto,
  findLessonByLevelAndTeacherIdDto,
  UpdateLessonDto,
} from './lesson.dto';
import { google } from 'googleapis';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import * as readline from 'readline';
import { Teacher } from 'src/teacher/teacher.entity';
dotenv.config();
@Injectable()
export class LessonService {
  // private youtube = google.youtube('v3');
  // private jwtClient = new google.auth.JWT({
  //   keyFile: 'bac-a-454215-6140aad75845.json', // Đường dẫn tới file JSON của Service Account
  //   scopes: ['https://www.googleapis.com/auth/youtube.upload'],
  // });
  // private oauth2Client = new google.auth.OAuth2(
  //   process.env.CLIENT_ID,
  //   process.env.CLIENT_SECRET,
  //   process.env.REDIRECT_URI,
  // );
  // private oauth2Client = new google.auth.OAuth2(
  //   '355945554288-lc8pvnl60pb9qie4g4bgmpeng3rn4v2l.apps.googleusercontent.com',
  //   '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',
  //   'http://localhost:3000/google/callback',
  // );

  constructor(
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
  ) {
    // this.oauth2Client.setCredentials({
    //   refresh_token: process.env.REFRESH_TOKEN,
    // });
    // this.jwtClient.authorize((err, tokens) => {
    //   if (err) {
    //     console.error('Error authorizing Service Account:', err);
    //     return;
    //   }
    //   console.log('Service Account authenticated successfully:', tokens);
    // });
  }

  async findAll(): Promise<Lesson[]> {
    return await this.lessonRepository.find({
      where: { isDelete: false },
      relations: ['teacher'],
    });
  }
  async findLessonByLevelAndTeacherId(
    findLessonByLevelAndTeacherId: findLessonByLevelAndTeacherIdDto,
  ): Promise<Lesson[]> {
    const teacher = await this.teacherRepository.find({
      where: { id: findLessonByLevelAndTeacherId.teacherId },
    });
    return await this.lessonRepository.find({
      where: {
        level: findLessonByLevelAndTeacherId.level,
        teacher,
        isDelete: false,
      },
      relations: ['teacher'],
    });
  }
  async findLessonByTeacherId(teacherId: number): Promise<Lesson[]> {
    const teacher = await this.teacherRepository.find({
      where: { id: teacherId },
    });
    return await this.lessonRepository.find({
      where: {
        teacher,
        isDelete: false,
      },
      relations: ['teacher'],
    });
  }
  async findOne(id: number): Promise<Lesson> {
    const lesson = await this.lessonRepository.findOne({
      where: { id, isDelete: false },
      relations: ['teacher'],
    });
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }
    return lesson;
  }

  async create(createLessonDto: CreateLessonDto): Promise<Lesson> {
    const { teacherId, ...rest } = createLessonDto;

    // Tìm teacher theo ID
    const teacher = await this.teacherRepository.findOne({
      where: { id: teacherId, isDelete: false },
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${teacherId} not found`);
    }

    // Tạo class và gán teacher
    const lessonEntity = this.lessonRepository.create({
      ...rest,
      teacher, // Gán trực tiếp teacher vào entity
    });

    return await this.lessonRepository.save(lessonEntity);
  }

  async update(id: number, updateLessonDto: UpdateLessonDto): Promise<Lesson> {
    const { teacherId, ...rest } = updateLessonDto;
    // Tìm class cần update
    const lessonEntity = await this.findOne(id);
    if (!lessonEntity) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }
    if (teacherId !== undefined) {
      const teacher = await this.teacherRepository.findOne({
        where: { id: teacherId },
      });

      if (!teacher) {
        throw new NotFoundException(`Teacher with ID ${teacherId} not found`);
      }

      lessonEntity.teacher = teacher;
    }

    // Cập nhật các field còn lại
    Object.assign(lessonEntity, rest);

    return await this.lessonRepository.save(lessonEntity);
  }

  async remove(id: number): Promise<void> {
    // const result = await this.lessonRepository.delete(id);
    // if (result.affected === 0) {
    //   throw new NotFoundException(`Lesson with ID ${id} not found`);
    // }
    const Lesson = await this.lessonRepository.findOne({
      where: { id, isDelete: false },
    });
    if (!Lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }
    Lesson.isDelete = true;
    await this.lessonRepository.save(Lesson);
  }
  // private async refreshAccessToken() {
  //   try {
  //     const { credentials } = await this.oauth2Client.refreshAccessToken();
  //     this.oauth2Client.setCredentials(credentials);
  //     console.log('Access Token refreshed');
  //   } catch (error) {
  //     console.error('Error refreshing Access Token:', error);
  //     throw error;
  //   }
  // }

  // async uploadVideo(
  //   file: any,
  //   title: string,
  //   description: string,
  //   status: boolean,
  // ) {
  //   // await this.jwtClient.authorize();
  //   const accessToken = await this.refreshAccessToken();
  //   const youtube = google.youtube({ version: 'v3', auth: this.oauth2Client });
  //   // const authUrl = this.oauth2Client.generateAuthUrl({
  //   //   access_type: 'offline', // Bắt buộc để lấy refresh token
  //   //   scope: ['https://www.googleapis.com/auth/youtube.upload'],
  //   // });
  //   // console.log('Open this URL in your browser:', authUrl);
  //   // const rl = readline.createInterface({
  //   //   input: process.stdin,
  //   //   output: process.stdout,
  //   // });

  //   // rl.question('Enter the code from that page here: ', async (code) => {
  //   //   const { tokens } = await this.oauth2Client.getToken(code);
  //   //   console.log('Your refresh token:', tokens.refresh_token);
  //   //   rl.close();
  //   // });
  //   if (!file.path) {
  //     throw new Error('File path is undefined! Kiểm tra lại multer dest.');
  //   }

  //   const filePath = file.path;
  //   console.log('Uploading file from:', filePath);

  //   const fileStream = fs.createReadStream(filePath);
  //   const fileSize = fs.statSync(filePath).size;

  //   try {
  //     console.log(`Uploading video: ${filePath}`);

  //     const res = await youtube.videos.insert(
  //       {
  //         auth: this.oauth2Client,
  //         part: ['snippet', 'status'],
  //         requestBody: {
  //           snippet: {
  //             title: title,
  //             description: description,
  //           },
  //           status: {
  //             privacyStatus: status ? 'public' : 'private',
  //           },
  //         },
  //         media: {
  //           body: fileStream,
  //         },
  //       },
  //       {
  //         onUploadProgress: (evt) => {
  //           const progress = (evt.bytesRead / fileSize) * 100;
  //           console.log(`Upload progress: ${progress.toFixed(2)}%`);
  //         },
  //       },
  //     );

  //     console.log('Video uploaded successfully:', res.data);

  //     if (res.data.id) {
  //       fs.unlinkSync(filePath);
  //       console.log('Temp file deleted.');
  //     }

  //     return res.data;
  //   } catch (error) {
  //     console.error('Error uploading video:', error);
  //     throw error;
  //   }
  // }
}
