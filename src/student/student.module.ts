import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from './student.entity';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import { Class } from 'src/class/class.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Student, Class])],
  providers: [StudentService],
  controllers: [StudentController],
  exports: [TypeOrmModule],
})
export class StudentModule {}
