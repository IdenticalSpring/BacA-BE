import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserNotification } from './user_notification.entity';
import {
  CreateUserNotificationDto,
  UpdateUserNotificationDto,
} from './user_notification.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { Notification } from 'src/notification/notification.entity';
import { Student } from 'src/student/student.entity';

@Injectable()
export class UserNotificationService {
  constructor(
    @InjectRepository(UserNotification)
    private readonly userNotificationRepository: Repository<UserNotification>,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
  ) {}

  async findAll(): Promise<UserNotification[]> {
    return await this.userNotificationRepository.find({
      where: { isDelete: false },
      relations: ['notification', 'student'],
    });
  }

  async findOne(id: number): Promise<UserNotification> {
    const userNotification = await this.userNotificationRepository.findOne({
      where: { id, isDelete: false },
      relations: ['notification', 'student'],
    });
    if (!userNotification) {
      throw new NotFoundException(`User notification with ID ${id} not found`);
    }
    return userNotification;
  }
  async create(
    createUserNotificationDto: CreateUserNotificationDto,
  ): Promise<UserNotification> {
    const { studentID, notificationID, ...rest } = createUserNotificationDto;
    const userNotification = this.userNotificationRepository.create(rest);

    if (studentID) {
      const studentEntity = await this.studentRepository.findOne({
        where: { id: studentID },
      });
      if (!studentEntity) {
        throw new NotFoundException(`Student with ID ${studentID} not found`);
      }
      userNotification.student = studentEntity;
    }
    if (notificationID) {
      const notificationEntity = await this.notificationRepository.findOne({
        where: { id: notificationID },
      });
      if (!notificationEntity) {
        throw new NotFoundException(
          `Notification with ID ${studentID} not found`,
        );
      }
      userNotification.notification = notificationEntity;
    }

    return await this.userNotificationRepository.save(userNotification);
  }

  async update(
    id: number,
    updateUserNotificationDto: UpdateUserNotificationDto,
  ): Promise<UserNotification> {
    const { studentID, notificationID, ...rest } = updateUserNotificationDto;
    const userNotification = await this.findOne(id);
    if (!userNotification) {
      throw new NotFoundException(`User notification with ID ${id} not found`);
    }
    if (studentID) {
      const studentEntity = await this.studentRepository.findOne({
        where: { id: studentID },
      });
      if (!studentEntity) {
        throw new NotFoundException(`Student with ID ${studentID} not found`);
      }
      userNotification.student = studentEntity;
    }
    if (notificationID) {
      const notificationEntity = await this.notificationRepository.findOne({
        where: { id: notificationID },
      });
      if (!notificationEntity) {
        throw new NotFoundException(
          `Notification with ID ${studentID} not found`,
        );
      }
      userNotification.notification = notificationEntity;
    }

    Object.assign(userNotification, rest);
    return await this.userNotificationRepository.save(userNotification);
  }

  async remove(id: number): Promise<void> {
    const userNotification = await this.userNotificationRepository.findOne({
      where: { id, isDelete: false },
    });
    if (!userNotification) {
      throw new NotFoundException(`User Notification with ID ${id} not found`);
    }
    userNotification.isDelete = true;
    await this.userNotificationRepository.save(userNotification);
  }
}
