import { On, Once, UseCollectors, UseGuards } from '@discord-nestjs/core';
import { Injectable, Logger } from '@nestjs/common';
import { Interaction } from 'discord.js';

import { MessageFromUserGuard } from './guards/message-from-user.guard';
import { PostInteractionCollector } from './post-interaction-collector';

@Injectable()
export class BotGateway {
  private readonly logger = new Logger(BotGateway.name);

  @Once('ready')
  onReady(): void {
    this.logger.log('Bot was started!');
  }

  @On('interactionCreate')
  @UseGuards(MessageFromUserGuard)
  @UseCollectors(PostInteractionCollector)
  async onMessage(interaction: Interaction): Promise<void> {}
}
