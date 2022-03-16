import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';

import { AppreciatedReactionCollector } from './appreciated-reaction-collector';
import { BotGateway } from './bot.gateway';

@Module({
  imports: [DiscordModule.forFeature()],
  providers: [BotGateway, AppreciatedReactionCollector],
})
export class BotModule {}
