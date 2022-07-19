import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GatewayIntentBits } from 'discord.js';

import { BotModule } from './bot/bot.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DiscordModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        token: configService.get('TOKEN'),
        discordClientOptions: {
          intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            // You must allow message content for your application in discord developers
            // https://support-dev.discord.com/hc/en-us/articles/4404772028055
            GatewayIntentBits.MessageContent,
          ],
        },
        prefix: '!',
      }),
      inject: [ConfigService],
    }),
    BotModule,
  ],
})
export class AppModule {}
