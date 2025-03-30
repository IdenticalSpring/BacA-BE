import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from './student.entity';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import { Class } from 'src/class/class.entity';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student, Class]),
    CloudinaryModule,
    forwardRef(() => AuthModule),
  ],
  providers: [StudentService],
  controllers: [StudentController],
  exports: [TypeOrmModule],
})
export class StudentModule {}
