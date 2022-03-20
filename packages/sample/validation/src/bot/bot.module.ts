import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';

import { StatsCommand } from './commands/stats.command';

@Module({
  imports: [DiscordModule.forFeature()],
  providers: [StatsCommand],
})
export class BotModule {}
