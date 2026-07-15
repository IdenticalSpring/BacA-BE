import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from './student.entity';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import { Class } from 'src/class/class.entity';
import { AuthModule } from 'src/auth/auth.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student, Class]),
    forwardRef(() => AuthModule),
    NotificationModule,
  ],
  providers: [StudentService],
  controllers: [StudentController],
  exports: [TypeOrmModule],
})
export class StudentModule {}
