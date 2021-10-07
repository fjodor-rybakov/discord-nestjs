import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Intents } from 'discord.js';
import { DiscordModule } from '@discord-nestjs/core';
import { BotGateway } from './bot.gateway';

@Module({
  imports: [
    DiscordModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        token: configService.get('TOKEN'),
        discordClientOptions: {
          intents: [Intents.FLAGS.GUILDS],
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [BotGateway],
})
export class BotModule {}
