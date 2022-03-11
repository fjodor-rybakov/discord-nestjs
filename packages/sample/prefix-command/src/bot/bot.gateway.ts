import {
  InjectDiscordClient,
  OnPrefixCommand,
  Once,
  UsePipes,
} from '@discord-nestjs/core';
import { Injectable, Logger } from '@nestjs/common';
import { Client, Message } from 'discord.js';

import { MessageToUpperPipe } from './pipes/message-to-upper.pipe';

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
  @UsePipes(MessageToUpperPipe)
  async onMessage(message: Message): Promise<void> {
    this.logger.log(`Incoming message: ${message.content}`);

    await message.reply('Message processed successfully');
  }
}
