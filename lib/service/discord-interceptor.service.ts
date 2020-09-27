import { DiscordInterceptor } from '..';
import { ClientEvents, Message } from 'discord.js';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DiscordInterceptorService {
  async applyInterceptors(
    interceptors: (DiscordInterceptor | Function)[],
    event: keyof ClientEvents,
    context: any
  ): Promise<any> {
    return interceptors.reduce(async (prev: Promise<Message>, curr: DiscordInterceptor | Function) => {
      let interceptorInstance: DiscordInterceptor;
      if (typeof curr === 'function') {
        // @ts-ignore
        interceptorInstance = new curr();
      }
      const prevData = await prev;
      return interceptorInstance.intercept(event, prevData);
    }, context);
  }
}
