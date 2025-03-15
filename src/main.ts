import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cho phép CORS
  app.enableCors({
    origin: [
      'http://localhost:8999',
      'http://localhost:3000',
      'https://bac-a.vercel.app',
      'https://bac-a-trng-le-minh-nhts-projects.vercel.app',
    ], // Thay bằng domain frontend của bạn
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Cho phép gửi cookie hoặc token nếu cần
  });

  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
