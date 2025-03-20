import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassTestScheduleService } from './classTestSchedule.service';
import { ClassTestScheduleEntity } from './classTestSchedule.entity';
import { ClassTestScheduleController } from './classTestSchedule.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ClassTestScheduleEntity])],
  providers: [ClassTestScheduleService],
  controllers: [ClassTestScheduleController],
  exports: [ClassTestScheduleService],
})
export class ClassTestScheduleModule {}
