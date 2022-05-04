import { Injectable } from '@nestjs/common';

import { DiscordMiddleware } from '../../decorators/middleware/discord-middleware';
import { EventArgs, EventType } from '../../definitions/types/event.type';
import { ReflectMetadataProvider } from '../../providers/reflect-metadata.provider';
import { ClassExplorer } from '../interfaces/class-explorer';
import { ClassExplorerOptions } from '../interfaces/class-explorer-options';
import { DiscordMiddlewareInstance } from './discord-middleware-instance';

@Injectable()
export class MiddlewareExplorer implements ClassExplorer {
  private readonly middlewareList: DiscordMiddlewareInstance[] = [];

  constructor(private readonly metadataProvider: ReflectMetadataProvider) {}

  explore(options: ClassExplorerOptions): void {
    const { instance } = options;
    if (!this.instanceIsMiddleware(instance)) return;

    const metadata =
      this.metadataProvider.getMiddlewareDecoratorMetadata(instance);
    this.middlewareList.push({ instance, metadata });
  }

  async applyMiddleware<TEvent extends EventType = EventType>(
    event: TEvent,
    eventArgs: EventArgs<TEvent>,
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
        item.instance.use(event, eventArgs),
      ),
    );
  }

  private instanceIsMiddleware(
    instance: any | DiscordMiddleware,
  ): instance is DiscordMiddleware {
    return !!instance && !!instance.use;
  }
}
