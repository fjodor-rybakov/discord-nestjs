import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';

import { RegisterCommand } from './commands/register.command';

@Module({
  imports: [DiscordModule.forFeature()],
  providers: [RegisterCommand],
})
export class BotModule {}
