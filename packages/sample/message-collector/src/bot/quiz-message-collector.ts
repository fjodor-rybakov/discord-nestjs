import { MessageCollector, On, Once, UseGuards } from '@discord-nestjs/core';
import { Logger } from '@nestjs/common';
import { Message } from 'discord.js';

import { MessageFromUserGuard } from './guards/message-from-user.guard';

@MessageCollector({ time: 15000 })
export class QuizMessageCollector {
  private readonly logger = new Logger(QuizMessageCollector.name);

  @On('collect')
  @UseGuards(MessageFromUserGuard)
  onCollect({ author, content }: Message): void {
    this.logger.log(`User "${author.username}" answered ${content}`);
  }

  @Once('end')
  onEnd(): void {
    this.logger.log('Quiz is over!');
  }
}
