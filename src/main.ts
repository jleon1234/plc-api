import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'https://skyblue-hawk-957796.hostingersite.com',
    credentials: true
  });
  await app.listen(3000);
}
bootstrap();
