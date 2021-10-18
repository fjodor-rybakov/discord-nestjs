import { On } from '@discord-nestjs/core';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class BotGateway {
  private readonly logger = new Logger(BotGateway.name);

  @On('ready')
  onReady() {
    this.logger.log('Bot was started!');
  }
}
