import { CollectorInterceptor } from '@discord-nestjs/common';
import { On, Once, UseCollectors } from '@discord-nestjs/core';
import { Injectable, Logger, UseGuards, UseInterceptors } from '@nestjs/common';
import { Message } from 'discord.js';

import { AppreciatedReactionCollector } from './appreciated-reaction-collector';
import { MessageFromUserGuard } from './guards/message-from-user.guard';

@Injectable()
export class BotGateway {
  private readonly logger = new Logger(BotGateway.name);

  @Once('ready')
  onReady(): void {
    this.logger.log('Bot was started!');
  }

  @On('messageCreate')
  @UseInterceptors(CollectorInterceptor)
  @UseGuards(MessageFromUserGuard)
  @UseCollectors(AppreciatedReactionCollector)
  async onMessage(message: Message): Promise<void> {
    await message.reply('Start collector');
  }
}
