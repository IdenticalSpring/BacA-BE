import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestService } from './test.service';
import { TestController } from './test.controller';
import { TestEntity } from './test.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TestEntity])],
  providers: [TestService],
  controllers: [TestController],
})
export class TestModule {}
