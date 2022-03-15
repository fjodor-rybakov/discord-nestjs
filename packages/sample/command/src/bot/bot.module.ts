import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { InjectDynamicProviders } from 'nestjs-dynamic-providers';

@InjectDynamicProviders('**/*.command.js')
@Module({
  imports: [DiscordModule.forFeature()],
})
export class BotModule {}
