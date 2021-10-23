import { MessageFromUserGuard } from './guards/message-from-user.guard';
import { MessageToUpperPipe } from './pipes/message-to-upper.pipe';
import { On, Once, UsePipes, UseGuards } from '@discord-nestjs/core';
import { Injectable, Logger } from '@nestjs/common';
import { Message } from 'discord.js';

@Injectable()
export class BotGateway {
  private readonly logger = new Logger(BotGateway.name);

  @Once('ready')
  onReady() {
    this.logger.log('Bot was started!');
  }

  @On('messageCreate')
  @UseGuards(MessageFromUserGuard)
  @UsePipes(MessageToUpperPipe)
  async onMessage(message: Message): Promise<void> {
    this.logger.log(`Incoming message: ${message.content}`);

    await message.reply('Message processed successfully');
  }
}
