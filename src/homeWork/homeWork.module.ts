import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomeWork } from './homeWork.entity';
import { HomeWorkService } from './homeWork.service';
import { HomeWorkController } from './homeWork.controller';
import { Teacher } from 'src/teacher/teacher.entity';
import { TeacherModule } from 'src/teacher/teacher.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([HomeWork, Teacher]),
    forwardRef(() => TeacherModule),
  ],
  providers: [HomeWorkService],
  controllers: [HomeWorkController],
  exports: [TypeOrmModule, HomeWorkService],
})
export class HomeWorkModule {}
