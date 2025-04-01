import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFeedbackDto, UpdateFeedbackDto } from './feedback.dto';
import { Student } from 'src/student/student.entity';
import { Feedback } from './feedback.entity';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private readonly feedbackRepository: Repository<Feedback>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
  ) {}

  async create(createFeedbackDto: CreateFeedbackDto): Promise<Feedback> {
    const student = await this.studentRepository.findOne({
      where: { id: createFeedbackDto.studentID },
    });
    if (!student) {
      throw new NotFoundException(
        `Student with ID ${createFeedbackDto.studentID} not found`,
      );
    }

    const feedback = this.feedbackRepository.create({
      ...createFeedbackDto,
      student,
    });
    return this.feedbackRepository.save(feedback);
  }
  async getFeedbackByStudentID(studentID: number): Promise<Feedback[]> {
    const student = await this.studentRepository.findOne({
      where: { id: studentID },
    });
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentID} not found`);
    }

    return this.feedbackRepository.find({
      where: { student: { id: studentID } },
      relations: ['student'],
    });
  }

  async findAll(): Promise<Feedback[]> {
    return this.feedbackRepository.find({ relations: ['student'] });
  }

  async findOne(id: number): Promise<Feedback> {
    const feedback = await this.feedbackRepository.findOne({
      where: { id },
      relations: ['student'],
    });
    if (!feedback) {
      throw new NotFoundException(`Feedback with ID ${id} not found`);
    }
    return feedback;
  }

  async update(
    id: number,
    updateFeedbackDto: UpdateFeedbackDto,
  ): Promise<Feedback> {
    const feedback = await this.findOne(id);
    Object.assign(feedback, updateFeedbackDto);
    return this.feedbackRepository.save(feedback);
  }

  async remove(id: number): Promise<void> {
    const feedback = await this.findOne(id);
    await this.feedbackRepository.remove(feedback);
  }
}
