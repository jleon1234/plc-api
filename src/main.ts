import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*', // Permite cualquier origenss
    credentials: true, // Esto permite que las cookies y credenciales se incluyan en las solicitudes
  });
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
