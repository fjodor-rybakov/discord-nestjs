import {
  PrefixCommandInterceptor,
  PrefixCommandPipe,
} from '@discord-nestjs/common/src';
import { InjectDiscordClient, Once } from '@discord-nestjs/core';
import { MSG, On } from '@discord-nestjs/core/src';
import { Injectable, Logger, UseInterceptors } from '@nestjs/common';
import { Client } from 'discord.js';

import { StartDto } from './dto/start.dto';

@Injectable()
export class BotGateway {
  private readonly logger = new Logger(BotGateway.name);

  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
  ) {}

  @Once('ready')
  onReady() {
    this.logger.log(`Bot ${this.client.user.tag} was started!`);
  }

  @On('messageCreate')
  @UseInterceptors(new PrefixCommandInterceptor('start'))
  async onMessage(@MSG(PrefixCommandPipe) dto: StartDto): Promise<string> {
    console.log(dto);

    return 'Message processed successfully';
  }
}
