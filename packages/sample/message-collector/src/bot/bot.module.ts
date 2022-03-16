import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';

import { BotGateway } from './bot.gateway';
import { QuizMessageCollector } from './quiz-message-collector';

@Module({
  imports: [DiscordModule.forFeature()],
  providers: [BotGateway, QuizMessageCollector],
})
export class BotModule {}
