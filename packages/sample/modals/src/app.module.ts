import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { default as discordModals } from 'discord-modals';
import { Client, Intents } from 'discord.js';

import { BotModule } from './bot/bot.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DiscordModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        token: configService.get('TOKEN'),
        discordClientOptions: {
          // https://stackoverflow.com/questions/64006888/can-anyone-explain-the-issue
          intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, 32767],
        },
        registerCommandOptions: [
          {
            forGuild: configService.get('GUILD_ID_WITH_COMMANDS'),
            removeCommandsBefore: true,
          },
        ],
      }),
      setupClientFactory: (client: Client) => discordModals(client),
      inject: [ConfigService],
    }),
    BotModule,
  ],
})
export class AppModule {}
