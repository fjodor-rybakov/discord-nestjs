import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Intents, Message } from 'discord.js';
import { ApplicationCommandPermissionTypes } from 'discord.js/typings/enums';

import { PlaylistCommand } from './commands/playlist.command';

@Module({
  imports: [
    DiscordModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        token: configService.get('TOKEN'),
        commands: ['**/*.command.js'],
        discordClientOptions: {
          intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
        },
        removeGlobalCommands: true,
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
            commandClassType: PlaylistCommand,
            permissions: [
              {
                id: configService.get('ROLE_WITHOUT_PLAYLIST_PERMISSION'),
                type: ApplicationCommandPermissionTypes.ROLE,
                permission: false,
              },
            ],
          },
        ],
      }),
      inject: [ConfigService],
    }),
  ],
})
export class BotModule {}
