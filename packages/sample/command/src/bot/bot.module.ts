import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Intents } from 'discord.js';
import { DiscordModule } from '@discord-nestjs/core';
import { RegistrationCommand } from './registration-command';

@Module({
  imports: [
    DiscordModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        token: configService.get('TOKEN'),
        commands: [RegistrationCommand],
        discordClientOptions: {
          intents: [Intents.FLAGS.GUILDS],
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class BotModule {}
