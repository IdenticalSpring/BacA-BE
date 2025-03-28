import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import {
  CreateNotificationDto,
  UpdateNotificationDto,
} from './notification.dto';
import { Class } from 'src/class/class.entity';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async findAll(): Promise<Notification[]> {
    return await this.notificationRepository.find({
      where: { isDelete: false },
      relations: ['class'],
    });
  }

  async findOne(id: number): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id, isDelete: false },
      relations: ['class'],
    });
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    return notification;
  }
  async create(
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    const { classID, ...rest } = createNotificationDto;
    const notification = this.notificationRepository.create(rest);

    if (classID) {
      const classEntity = await this.classRepository.findOne({
        where: { id: classID },
      });
      if (!classEntity) {
        throw new NotFoundException(`Class with ID ${classID} not found`);
      }
      notification.class = classEntity;
    }

    return await this.notificationRepository.save(notification);
  }

  async update(
    id: number,
    updateNotificationDto: UpdateNotificationDto,
  ): Promise<Notification> {
    const { classID, ...rest } = updateNotificationDto;
    const notification = await this.findOne(id);
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    if (classID) {
      const classEntity = await this.classRepository.findOne({
        where: { id: classID },
      });
      if (!classEntity) {
        throw new NotFoundException(`Class with ID ${classID} not found`);
      }
      notification.class = classEntity;
    }

    Object.assign(notification, rest);
    return await this.notificationRepository.save(notification);
  }

  async remove(id: number): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      where: { id, isDelete: false },
    });
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    notification.isDelete = true;
    await this.notificationRepository.save(notification);
  }
}
