import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Intents } from 'discord.js';

import { BotGateway } from './bot.gateway';
import { QuizMessageCollector } from './quiz-message-collector';

@Module({
  imports: [
    DiscordModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        token: configService.get('TOKEN'),
        discordClientOptions: {
          intents: [
            Intents.FLAGS.GUILDS,
            Intents.FLAGS.GUILD_MESSAGES,
            Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
          ],
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [BotGateway, QuizMessageCollector],
})
export class BotModule {}
