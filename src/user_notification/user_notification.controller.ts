import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { UserNotificationService } from './user_notification.service';
import {
  CreateUserNotificationDto,
  UpdateUserNotificationDto,
} from './user_notification.dto';
import { UserNotification } from './user_notification.entity';
@Controller('user_notification')
export class UserNotificationController {
  constructor(
    private readonly userNotificationService: UserNotificationService,
  ) {}

  @Get()
  async findAll(): Promise<UserNotification[]> {
    return await this.userNotificationService.findAll();
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserNotification> {
    return await this.userNotificationService.findOne(id);
  }
  @Post()
  async create(
    @Body() createUserNotificationDto: CreateUserNotificationDto,
  ): Promise<UserNotification> {
    return await this.userNotificationService.create(createUserNotificationDto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserNotificationDto: UpdateUserNotificationDto,
  ): Promise<UserNotification> {
    return await this.userNotificationService.update(
      id,
      updateUserNotificationDto,
    );
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.userNotificationService.remove(id);
  }
}
