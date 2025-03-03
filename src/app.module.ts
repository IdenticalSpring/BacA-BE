import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { User } from './auth/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: '127.0.0.1', // Laragon mặc định chạy MySQL trên localhost
      port: 3306,
      username: 'root', // Mặc định của Laragon
      password: '', // Mặc định của Laragon là không có mật khẩu
      database: 'nestjs_auth',
      entities: [User], // Liên kết với entity User
      synchronize: true, // Dev mode: tự động tạo bảng
    }),
    AuthModule,
  ],
})
export class AppModule {}
