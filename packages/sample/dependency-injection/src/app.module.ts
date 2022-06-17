import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Intents, Message } from 'discord.js';
import { ApplicationCommandPermissionTypes } from 'discord.js/typings/enums';

import { BotModule } from './bot/bot.module';
import { PlayDto } from './bot/dto/play.dto';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DiscordModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        token: configService.get('TOKEN'),
        discordClientOptions: {
          intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
        },
        registerCommandOptions: [
          {
            forGuild: configService.get('GUILD_ID_WITH_COMMANDS'),
            allowFactory: (message: Message) =>
              !message.author.bot && message.content === '!deploy',
            removeCommandsBefore: true,
          },
        ],
        slashCommandsPermissions: [
          {
            commandClassType: PlayDto,
            permissions: [
              {
                id: configService.get('ROLE_WITHOUT_PLAYLIST_PERMISSION'),
                type: ApplicationCommandPermissionTypes.ROLE,
                permission: true,
              },
            ],
          },
        ],
      }),
      inject: [ConfigService],
    }),
    BotModule,
  ],
})
export class AppModule {}
