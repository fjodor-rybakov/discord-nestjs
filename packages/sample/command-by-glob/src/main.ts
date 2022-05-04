import { NestFactory } from '@nestjs/core';
import { resolveDynamicProviders } from 'nestjs-dynamic-providers';

import { AppModule } from './app.module';

async function bootstrap() {
  await resolveDynamicProviders();
  await NestFactory.createApplicationContext(AppModule);
}

bootstrap();
