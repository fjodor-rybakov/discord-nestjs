import { Client } from 'discord.js';
import { DiscordModuleOption } from './interface/discord-module-option';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';

@Injectable()
export class DiscordClient extends Client implements OnApplicationBootstrap {
  private readonly clientToken: string;
  private readonly commandPrefix: string;

  constructor(options: DiscordModuleOption) {
    const {token, commandPrefix, ...discordOption} = options
    super(discordOption);
    this.clientToken = token;
    this.commandPrefix = commandPrefix;
  }

  async onApplicationBootstrap(): Promise<void> {
    await this.login(this.clientToken);
  }

  public getCommandPrefix(): string {
    return this.commandPrefix;
  }
}
