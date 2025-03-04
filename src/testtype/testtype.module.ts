import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestType } from './testtype.entity';
import { TestTypeService } from './testtype.service';
import { TestTypeController } from './testtype.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TestType])],
  providers: [TestTypeService],
  controllers: [TestTypeController],
  exports: [TypeOrmModule],
})
export class TestTypeModule {}
