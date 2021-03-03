import { Injectable } from '@nestjs/common';
import { DiscordService } from './discord.service';
import { DiscordModuleCommandOptions } from '../interface/discord-module-command-options';
import { Message } from 'discord.js';

@Injectable()
export class DiscordAccessService {
  constructor(
    private readonly discordService: DiscordService
  ) {
  }

  isAllowCommand(
    commandName: string,
    channelId: string,
    userId: string,
    options: DiscordModuleCommandOptions[],
  ): boolean {
    if (options.length === 0) {
      return true;
    }
    return options.some((item: DiscordModuleCommandOptions) => {
      if (item.name !== commandName) {
        return true;
      }
      let isAllowUser = true, isAllowChannel = true;
      if (item.users && item.users.length !== 0) {
        isAllowUser = item.users.includes(userId);
      }
      if (item.channels && item.channels.length !== 0) {
        isAllowChannel = item.channels.includes(channelId);
      }
      return isAllowUser && isAllowChannel;
    });
  }

  isAllowMessageGuild(
    message: Message,
  ): boolean {
    const guildId = message.guild && message.guild.id;
    if (!!guildId) {
      return this.discordService.isAllowGuild(guildId);
    }
    return true;
  }

  isDenyMessageGuild(message: Message): boolean {
    const guildId = message.guild && message.guild.id;
    if (!!guildId) {
      return this.discordService.isDenyGuild(guildId);
    }
    return false;
  }

  isAllowGuild(data: any[] = []): boolean {
    const guild = data.find((item) => !!item && !!item.guild);
    const guildId = !!guild && guild.guild.id;
    if (!!guildId) {
      return this.discordService.isAllowGuild(guildId);
    }
    return true;
  }

  isDenyGuild(data: any[] = []): boolean {
    const guild = data.find((item) => !!item && !!item.guild);
    const guildId = !!guild && guild.guild.id;
    if (!!guildId) {
      return this.discordService.isDenyGuild(guildId);
    }
    return false;
  }
}