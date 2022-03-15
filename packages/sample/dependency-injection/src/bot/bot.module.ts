import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';

import { PlayCommand } from './commands/play.command';
import { PlayService } from './services/play.service';

@Module({
  imports: [DiscordModule.forFeature()],
  providers: [PlayCommand, PlayService],
})
export class BotModule {}
