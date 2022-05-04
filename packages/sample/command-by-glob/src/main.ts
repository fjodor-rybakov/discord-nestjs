import { NestFactory } from '@nestjs/core';
import { exploreDynamicProviders } from 'nestjs-dynamic-providers';

import { AppModule } from './app.module';

async function bootstrap() {
  await exploreDynamicProviders();
  const app = await NestFactory.createApplicationContext(AppModule);
  await app.init();
}

bootstrap();
