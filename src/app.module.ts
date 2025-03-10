import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { StudentModule } from './student/student.module';
import { TeacherModule } from './teacher/teacher.module';
import { ScheduleModule } from './schedule/schedule.module';
import { ClassModule } from './class/class.module';
import { AssessmentsModule } from './assessments/assessments.module';
import { TeacherCommentOnStudentModule } from './teachercommentonstudent/teachercommentonstudent.module';
import { AdminModule } from './admin/admin.module';
import { LessonModule } from './lesson/lesson.module';
import { TestResultModule } from './testresult/testresult.module';
import { TestTypeModule } from './testtype/testtype.module';
import { TeacherTestCommentModule } from './teachertestcomment/teachertestcomment.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UploadController } from './upload/upload.controller';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ClassScheduleModule } from './classSchedule/classSchedule.module';
import { Schedule } from './schedule/schedule.entity';
import { Class } from './class/class.entity';
import { ClassSchedule } from './classSchedule/classSchedule.entity';
import { Lesson } from './lesson/lesson.entity';
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'schooldb-bac-a.h.aivencloud.com',
      port: 10975,
      username: 'avnadmin',
      password: 'AVNS_6Nx1CB-xoZSPRDVA-Im',
      database: 'schooldb',
      entities: [
        Lesson,
        ClassSchedule,
        Class,
        Schedule,
        __dirname + '/**/*.entity{.ts,.js}',
      ], // Tự động quét tất cả entity
      synchronize: true, // Chỉ dùng trong dev, tránh dùng production
    }),
    AuthModule,
    StudentModule,
    TeacherModule,
    ScheduleModule,
    ClassModule,
    AssessmentsModule,
    TeacherCommentOnStudentModule,
    AdminModule,
    ClassScheduleModule,
    LessonModule,
    TestResultModule,
    TestTypeModule,
    TeacherTestCommentModule,
    CloudinaryModule,
  ],
  controllers: [AppController, UploadController],
  providers: [AppService],
})
export class AppModule {}
