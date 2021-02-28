import { Injectable } from '@nestjs/common';
import { DiscordService } from './discord.service';
import { DiscordModuleChannelOptions } from '../interface/discord-module-channel-options';
import { Message } from 'discord.js';

@Injectable()
export class DiscordAccessService {
  constructor(
    private readonly discordService: DiscordService
  ) {
  }

  isAllowChannel(
    commandName: string,
    channelId: string,
    userId: string
  ): boolean {
    const allowGlobalChannels = this.discordService.getAllowChannels();
    if (allowGlobalChannels.length === 0) {
      return true;
    }
    return allowGlobalChannels.some((item: DiscordModuleChannelOptions) => {
      if (item.commandName !== commandName) {
        return true;
      }
      if (item.allowDirectMessageFor && item.allowDirectMessageFor.length !== 0) {
        return item.allowDirectMessageFor.includes(userId);
      }
      if (item.channels && item.channels.length !== 0) {
        return item.channels.includes(channelId);
      }
      return true;
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