import { Injectable } from '@nestjs/common';
import { ClientEvents } from 'discord.js';

@Injectable()
export class DiscordHandlerService {
  callHandler(
    instance: unknown,
    methodName: string,
    eventName: keyof ClientEvents,
    context: ClientEvents[keyof ClientEvents],
  ) {
    instance[methodName](...context);
  }
}