import { DiscordMiddlewareInstance } from './interface/discord-middleware-instance';
import { ClientEvents } from "discord.js";
import { Injectable } from '@nestjs/common';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { MIDDLEWARE_DECORATOR } from './constant/discord.constant';

@Injectable()
export class DiscordMiddlewareService {
  private readonly middlewareList: DiscordMiddlewareInstance[] = [];

  resolveMiddleware(providers: InstanceWrapper[]): DiscordMiddlewareInstance[] {
    providers.map((wrapper: InstanceWrapper) => {
      const { instance } = wrapper;
      if (instance) {
        const metadata = Reflect.getMetadata(MIDDLEWARE_DECORATOR, instance);
        if (metadata) {
          this.middlewareList.push({ instance, metadata });
        }
      }
    });
    return this.middlewareList;
  }

  async applyMiddleware(
    middlewareList: DiscordMiddlewareInstance[],
    event: keyof ClientEvents,
    context: ClientEvents[keyof ClientEvents]
  ): Promise<void> {
    const filteredMiddleware = middlewareList.filter((item: DiscordMiddlewareInstance) => {
      const isAllowEvent = item.metadata.allowEvents && !item.metadata.allowEvents.includes(event);
      const isDenyEvent = item.metadata.denyEvents && item.metadata.denyEvents.includes(event);
      return !(isDenyEvent || isAllowEvent);
    });
    await Promise.all(filteredMiddleware.map((item: DiscordMiddlewareInstance) => {
      return item.instance.use(event, context);
    }));
  }
}
