import { PrefixCommandTransformPipe } from '@discord-nestjs/common';
import {
  InjectDiscordClient,
  OnPrefixCommand,
  Once,
  Payload,
  UsePipes,
} from '@discord-nestjs/core';
import { Injectable, Logger } from '@nestjs/common';
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

  @OnPrefixCommand('start')
  @UsePipes(PrefixCommandTransformPipe)
  async onMessage(@Payload() dto: StartDto): Promise<string> {
    console.log(dto);

    return 'Message processed successfully';
  }
}
