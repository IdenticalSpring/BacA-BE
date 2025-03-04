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

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: '127.0.0.1',
      port: 3306,
      username: 'root',
      password: '',
      database: 'SchoolDB',
      entities: [__dirname + '/**/*.entity{.ts,.js}'], // Tự động quét tất cả entity
      synchronize: false, // Chỉ dùng trong dev, tránh dùng production
    }),
    AuthModule,
    StudentModule,
    TeacherModule,
    ScheduleModule,
    ClassModule,
    AssessmentsModule,
    TeacherCommentOnStudentModule,
    AdminModule,
    LessonModule,
    TestResultModule,
    TestTypeModule,
    TeacherTestCommentModule,
  ],
})
export class AppModule {}
