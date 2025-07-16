import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { IoAdapter } from '@nestjs/platform-socket.io';
async function bootstrap() {
  // const app = await NestFactory.create(AppModule);
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });
  app.useWebSocketAdapter(new IoAdapter(app));
  // Cho phép CORS
  app.enableCors({
    origin: [
      'http://localhost:8999',
      'http://localhost:3000',
      'https://bac-a.vercel.app',
      'https://bac-a-trng-le-minh-nhts-projects.vercel.app',
      'https://happyclass.com.vn',
      'http://happyclass.com.vn',
      'https://www.happyclass.com.vn',
      'http://www.happyclass.com.vn',
      'https://82.25.110.152:3000',
    ], // Thay bằng domain frontend của bạn
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Cho phép gửi cookie hoặc token nếu cần
  });
  app.use(bodyParser.json({ limit: '100mb' }));
  app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
