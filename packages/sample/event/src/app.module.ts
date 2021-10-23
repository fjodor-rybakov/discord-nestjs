import { BotModule } from './bot/bot.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot(), BotModule],
})
export class AppModule {}
