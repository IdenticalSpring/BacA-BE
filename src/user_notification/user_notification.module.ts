import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserNotification } from './user_notification.entity';
import { UserNotificationService } from './user_notification.service';
import { UserNotificationController } from './user_notification.controller';
import { Class } from 'src/class/class.entity';
import { Student } from 'src/student/student.entity';
import { Notification } from 'src/notification/notification.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserNotification, Student, Notification]),
  ],
  providers: [UserNotificationService],
  controllers: [UserNotificationController],
  exports: [TypeOrmModule],
})
export class UserNotificationModule {}
