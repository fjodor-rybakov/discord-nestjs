import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';

import { PlayCommand } from './commands/play.command';

@Module({
  imports: [DiscordModule.forFeature()],
  providers: [PlayCommand],
})
export class BotModule {}
