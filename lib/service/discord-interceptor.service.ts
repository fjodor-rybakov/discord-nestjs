import { DiscordInterceptor } from '..';
import { ClientEvents, Message } from 'discord.js';
import { Injectable } from '@nestjs/common';
import { ConstructorType } from '../utils/type/constructor-type';

@Injectable()
export class DiscordInterceptorService {
  applyInterceptors(
    interceptors: (DiscordInterceptor | ConstructorType)[],
    event: keyof ClientEvents,
    context: any,
  ): Promise<any> {
    return interceptors.reduce(
      async (
        prev: Promise<Message>,
        curr: DiscordInterceptor | ConstructorType,
      ) => {
        let interceptorInstance: DiscordInterceptor;
        if (typeof curr === 'function') {
          interceptorInstance = new curr();
        }
        const prevData = await prev;
        return interceptorInstance.intercept(event, prevData);
      },
      context,
    );
  }
}
