import { Client } from 'discord.js';
import { DiscordModuleOption } from './interface/discord-module-option';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';

@Injectable()
export class DiscordClient extends Client implements OnApplicationBootstrap {
  private readonly clientToken: string;
  private readonly commandPrefix: string;
  private readonly allowGuilds?: string[];

  constructor(options: DiscordModuleOption) {
    const {token, commandPrefix, allowGuilds, ...discordOption} = options
    super(discordOption);
    this.clientToken = token;
    this.commandPrefix = commandPrefix;
    this.allowGuilds = allowGuilds;
  }

  async onApplicationBootstrap(): Promise<void> {
    await this.login(this.clientToken);
  }

  public getCommandPrefix(): string {
    return this.commandPrefix;
  }

  public isAllowGuild(guildId: string): boolean {
    if (!this.allowGuilds) {
      return true;
    }
    return this.allowGuilds.includes(guildId);
  }
}
