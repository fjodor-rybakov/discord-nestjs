import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';

import { PlayCommand } from './command/play.command';
import { PostInteractionCollector } from './post-interaction-collector';

@Module({
  imports: [DiscordModule.forFeature()],
  providers: [PlayCommand, PostInteractionCollector],
})
export class BotModule {}
