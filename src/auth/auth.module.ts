import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy'; // ✅ Import strategy
import { AdminModule } from 'src/admin/admin.module';
import { AuthGuard } from './auth.guard';
import { Reflector } from '@nestjs/core';
import { TeacherModule } from 'src/teacher/teacher.module';
import { StudentModule } from 'src/student/student.module';
// console.log('JWT_SECRET:', process.env.JWT_SECRET);
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: 'jwt' }), // ✅ Đăng ký Passport
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey', // ✅ Đảm bảo secret đúng
      signOptions: { expiresIn: '24h' },
    }),
    AdminModule,
    TeacherModule,
    forwardRef(() => StudentModule),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, AuthGuard, Reflector],
  exports: [AuthService, AuthGuard, JwtModule],
})
export class AuthModule {}
