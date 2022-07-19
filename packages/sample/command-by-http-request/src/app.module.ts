import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GatewayIntentBits } from 'discord.js';
import { Subject } from 'rxjs';

import { BotModule } from './bot/bot.module';
import { REGISTER_COMMAND_SUBJECT } from './register/register.constant';
import { RegisterModule } from './register/register.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    RegisterModule,
    DiscordModule.forRootAsync({
      imports: [ConfigModule, RegisterModule],
      useFactory: (
        configService: ConfigService,
        registerCommandSubject: Subject<any>,
      ) => ({
        token: configService.get('TOKEN'),
        discordClientOptions: {
          intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
        },
        registerCommandOptions: [
          {
            forGuild: configService.get('GUILD_ID_WITH_COMMANDS'),
            trigger: () => registerCommandSubject,
            removeCommandsBefore: true,
          },
        ],
      }),
      inject: [ConfigService, REGISTER_COMMAND_SUBJECT],
    }),
    BotModule,
  ],
})
export class AppModule {}
