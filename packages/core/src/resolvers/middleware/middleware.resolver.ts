import { Injectable } from '@nestjs/common';
import { ClientEvents } from 'discord.js';
import { ClassResolver } from '../interfaces/class-resolver';
import { DiscordMiddlewareInstance } from './discord-middleware-instance';
import { ReflectMetadataProvider } from '../../providers/reflect-metadata.provider';
import { ClassResolveOptions } from '../interfaces/class-resolve-options';
import { DiscordMiddleware } from '../../decorators/middleware/discord-middleware';

@Injectable()
export class MiddlewareResolver implements ClassResolver {
  private readonly middlewareList: DiscordMiddlewareInstance[] = [];

  constructor(private readonly metadataProvider: ReflectMetadataProvider) {}

  resolve(options: ClassResolveOptions): void {
    const { instance } = options;
    if (!this.instanceIsMiddleware(instance)) {
      return;
    }
    const metadata =
      this.metadataProvider.getMiddlewareDecoratorMetadata(instance);
    this.middlewareList.push({ instance, metadata });
  }

  async applyMiddleware<T extends keyof ClientEvents>(
    event: T,
    context: ClientEvents[T],
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

  private instanceIsMiddleware(
    instance: any | DiscordMiddleware,
  ): instance is DiscordMiddleware {
    return !!instance && !!instance.use;
  }
}
