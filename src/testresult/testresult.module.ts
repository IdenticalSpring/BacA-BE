import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestResult } from './testresult.entity';
import { TestResultService } from './testresult.service';
import { TestResultController } from './testresult.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TestResult])],
  providers: [TestResultService],
  controllers: [TestResultController],
  exports: [TypeOrmModule],
})
export class TestResultModule {}
