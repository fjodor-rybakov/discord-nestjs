import { Injectable, Logger } from '@nestjs/common';
import { On } from '@discord-nestjs/core';

@Injectable()
export class BotGateway {
  private readonly logger = new Logger(BotGateway.name);

  @On('ready')
  onReady() {
    this.logger.log('Bot was started!');
  }
}
