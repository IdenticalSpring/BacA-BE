import { Module } from '@nestjs/common';
import { ScheduleModule as NestScheduleModule } from '@nestjs/schedule';
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
import { ClassScheduleModule } from './classSchedule/classSchedule.module';
import { Schedule } from './schedule/schedule.entity';
import { Class } from './class/class.entity';
import { ClassSchedule } from './classSchedule/classSchedule.entity';
import { Lesson } from './lesson/lesson.entity';
import { LessonByScheduleModule } from './lesson_by_schedule/lesson_by_schedule.module';
import { LessonBySchedule } from './lesson_by_schedule/lesson_by_schedule.entity';
import { CheckinModule } from './checkin/checkin.module';
import { TestModule } from './test/test.module';
import { ClassTestScheduleModule } from './classTestSchedule/classTestSchedule.module';
import { StudentScoreModule } from './studentScore/studentScore.module';
import { LevelModule } from './level/level.module';
import { HomeWorkModule } from './homeWork/homeWork.module';
import { SkillModule } from './skill/skill.module';
import { StudentSkillBehaviorScoreModule } from './studentskillbehaviorscore/studentskillbehaviorscore.module';
import { TestSkill } from './test_skills/test_skills.entity';
import { StudentScoreDetailsModule } from './student_score_detail/student_score_details.module';
import { TestSkillsModule } from './test_skills/test_skills.module';
import { GeminiModule } from './gemini/gemini.module';
import { NotificationModule } from './notification/notification.module';
import { UserNotificationModule } from './user_notification/user_notification.module';
import { FeedbackModule } from './feedback/feedback.module';
import { ContentPageModule } from './contentpage/contentpage.module';
import { Student_homework_countModule } from './student_homework_count/student_homework_count.module';
import { Student_lesson_countModule } from './student-lesson-count/student-lesson-count.module';
import { TeacherFeedbackModule } from './teacher_feedback/teacher_feedback.module';
import { PageVisitModule } from './pagevisit/pagevist.module';
import { SidebarModule } from './sidebar/sidebar.module';
import { VocabularyModule } from './vocabulary/vocabulary.module';
import { Student_vocabularyModule } from './student_vocabulary/student_vocabulary.module';
import { QuestionModule } from './question/question.module';
import { StudentQuestionAnswerModule } from './studentQuestionAnswer/studenQuestionAnser.module';
import { FilesModule } from './files/files.module';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ChatModule } from './chat/chat.module';
import { MessageModule } from './message/message.module';
import { ChatTopicModule } from './chat-topic/chat-topic.module';
import { PresentationModule } from './presentation/presentation.module';
@Module({
  imports: [
    NestScheduleModule.forRoot(),
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Nếu muốn giới hạn, thêm điều kiện ở đây
        // Ví dụ: chỉ cho phép hình ảnh
        // if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
        //   return cb(new Error('Only image files are allowed!'), false);
        // }
        cb(null, true); // Cho phép tất cả loại file
      },
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [
        Lesson,
        ClassSchedule,
        Class,
        Schedule,
        LessonBySchedule,
        __dirname + '/**/*.entity{.ts,.js}',
      ], // Tự động quét tất cả entity
      synchronize: process.env.DB_SYNCHRONIZE === 'true', // Chỉ dùng trong dev, tránh dùng production
      // logging: true,
    }),
    AuthModule,
    StudentModule,
    FilesModule,
    LessonModule,
    FeedbackModule,
    StudentSkillBehaviorScoreModule,
    TeacherModule,
    TestSkillsModule,
    ContentPageModule,
    StudentScoreDetailsModule,
    ScheduleModule,
    TestSkill,
    ClassModule,
    AssessmentsModule,
    PageVisitModule,
    TeacherFeedbackModule,
    TeacherCommentOnStudentModule,
    AdminModule,
    ClassScheduleModule,
    LessonByScheduleModule,
    TestResultModule,
    TestTypeModule,
    TeacherTestCommentModule,
    CheckinModule,
    TestModule,
    ClassTestScheduleModule,
    StudentScoreModule,
    LevelModule,
    HomeWorkModule,
    SidebarModule,
    SkillModule,
    ChatModule,
    MessageModule,
    ChatTopicModule,
    GeminiModule,
    NotificationModule,
    UserNotificationModule,
    Student_homework_countModule,
    Student_lesson_countModule,
    VocabularyModule,
    Student_vocabularyModule,
    QuestionModule,
    StudentQuestionAnswerModule,
    PresentationModule,
  ],
  controllers: [AppController, UploadController],
  providers: [AppService],
})
export class AppModule {}
