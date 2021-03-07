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
    message: Message,
    option: DiscordModuleCommandOptions,
  ): boolean {
    if (!option) {
      return true;
    }
    if (
      option.channelType &&
      option.channelType.length !== 0 &&
      !option.channelType.includes(message.channel.type)
    ) {
      // if channel type not allowed
      return false;
    }
    if (
      option.users &&
      option.users.length !== 0 &&
      !option.users.includes(message.author.id)
    ) {
      // if user not allowed
      return false;
    }
    if (
      option.channels &&
      option.channels.length !== 0 &&
      !option.channels.includes(message.channel.id)
    ) {
      // if channel not allowed
      return false;
    }
    return true;
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