import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';

import { BotGateway } from './bot.gateway';

@Module({
  imports: [DiscordModule.forFeature()],
  providers: [BotGateway],
})
export class BotModule {}
