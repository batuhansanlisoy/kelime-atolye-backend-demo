import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // class-validator için global pipeline
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // ekstra alan varsa bunları temizler
      forbidNonWhitelisted: true, // fazladan alan gönderilirse hata fırlatır
      transform: true, // verileri otomatik tip dönüşümü yapar
    }),
  );

  const configService = app.get(ConfigService);
  const frontendUrl = configService.get<string>('FRONTEND_URL');

  app.enableCors({
    origin: frontendUrl,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
