import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Class } from './class.entity';
import { ClassService } from './class.service';
import { ClassController } from './class.controller';
import { Teacher } from 'src/teacher/teacher.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Class, Teacher])],
  providers: [ClassService],
  controllers: [ClassController],
  exports: [TypeOrmModule],
})
export class ClassModule {}
