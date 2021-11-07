import { On, Once, UseCollectors, UseGuards } from '@discord-nestjs/core';
import { ExecutionContext } from '@discord-nestjs/core/src/definitions/interfaces/execution-context';
import { Injectable, Logger } from '@nestjs/common';
import { Interaction } from 'discord.js';

import { MessageFromUserGuard } from './guards/message-from-user.guard';
import { PostMessageCollector } from './post-message-collector';

@Injectable()
export class BotGateway {
  private readonly logger = new Logger(BotGateway.name);

  @Once('ready')
  onReady(): void {
    this.logger.log('Bot was started!');
  }

  @On('interactionCreate')
  @UseGuards(MessageFromUserGuard)
  @UseCollectors(PostMessageCollector)
  async onMessage(
    interaction: Interaction,
    ctx: ExecutionContext,
  ): Promise<void> {}
}
