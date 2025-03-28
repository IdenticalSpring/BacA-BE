import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './notification.entity';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { Class } from 'src/class/class.entity';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, Class]), CloudinaryModule],
  providers: [NotificationService],
  controllers: [NotificationController],
  exports: [TypeOrmModule],
})
export class NotificationModule {}
