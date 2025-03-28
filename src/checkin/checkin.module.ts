import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckinService } from './checkin.service';
import { CheckinController } from './checkin.controller';
import { Checkin } from './checkin.entity';
import { Student } from 'src/student/student.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Checkin, Student])],
  controllers: [CheckinController],
  providers: [CheckinService],
})
export class CheckinModule {}
