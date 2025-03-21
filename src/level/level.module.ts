import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Level } from './level.entity';
import { AuthModule } from 'src/auth/auth.module';
import { LevelService } from './level.service';
import { LevelController } from './level.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Level]), AuthModule],
  providers: [LevelService],
  controllers: [LevelController],
  exports: [TypeOrmModule],
})
export class LevelModule {}
