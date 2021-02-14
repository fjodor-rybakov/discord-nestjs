import { Injectable } from '@nestjs/common';
import { ReflectMetadataProvider } from '../provider/reflect-metadata.provider';
import { ClassResolveOptions } from './interface/class-resolve-options';
import { DiscordMiddleware } from '../decorator/interface/discord-middleware';
import { ClientEvents } from 'discord.js';
import { DiscordMiddlewareInstance } from './interface/discord-middleware-instance';

@Injectable()
export class MiddlewareResolver {
  private readonly middlewareList: DiscordMiddlewareInstance[] = [];

  constructor(
    private readonly metadataProvider: ReflectMetadataProvider,
  ) {
  }

  resolve(options: ClassResolveOptions): void {
    const { instance } = options;
    if (!this.instanceIsMiddleware(instance)) {
      return;
    }
    const metadata = this.metadataProvider.getMiddlewareDecoratorMetadata(instance);
    this.middlewareList.push({ instance, metadata });
  }

  async applyMiddleware(
    event: keyof ClientEvents,
    context: ClientEvents[keyof ClientEvents],
  ): Promise<void> {
    const filteredMiddleware = this.middlewareList.filter(
      (item: DiscordMiddlewareInstance) => {
        const isAllowEvent =
          item.metadata.allowEvents &&
          !item.metadata.allowEvents.includes(event);
        const isDenyEvent =
          item.metadata.denyEvents && item.metadata.denyEvents.includes(event);
        return !(isDenyEvent || isAllowEvent);
      },
    );
    await Promise.all(
      filteredMiddleware.map((item: DiscordMiddlewareInstance) =>
        item.instance.use(event, context),
      ),
    );
  }

  private instanceIsMiddleware(instance: any | DiscordMiddleware): instance is DiscordMiddleware {
    return !!instance && !!instance.use;
  }
}