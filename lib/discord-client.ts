import { Client } from 'discord.js';
import { DiscordModuleOption } from './interface/discord-module-option';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { DiscordModuleChannelOptions } from './interface/discord-module-channel-options';

@Injectable()
export class DiscordClient extends Client implements OnApplicationBootstrap {
  private readonly clientToken: string;
  private readonly commandPrefix: string;
  private readonly allowGuilds?: string[];
  private readonly denyGuilds?: string[];
  private readonly allowChannels?: DiscordModuleChannelOptions[];

  constructor(options: DiscordModuleOption) {
    const {
      token,
      commandPrefix,
      allowGuilds,
      denyGuilds,
      allowChannels,
      ...discordOption
    } = options;
    super(discordOption);
    this.clientToken = token;
    this.commandPrefix = commandPrefix;
    this.allowGuilds = allowGuilds;
    this.denyGuilds = denyGuilds;
    this.allowChannels = allowChannels ?? [];
  }

  async onApplicationBootstrap(): Promise<void> {
    await this.login(this.clientToken);
  }

  public getCommandPrefix(): string {
    return this.commandPrefix;
  }

  public getAllowChannels(): DiscordModuleChannelOptions[] {
    return this.allowChannels;
  }

  public isAllowGuild(guildId: string): boolean {
    if (!this.allowGuilds) {
      return true;
    }
    return this.allowGuilds.includes(guildId);
  }

  public isDenyGuild(guildId: string): boolean {
    if (!this.denyGuilds) {
      return false;
    }
    return this.denyGuilds.includes(guildId);
  }
}
