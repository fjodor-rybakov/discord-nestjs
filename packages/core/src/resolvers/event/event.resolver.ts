import { Injectable, Logger } from '@nestjs/common';
import { ClientEvents } from 'discord.js';

import { ExecutionContext } from '../../definitions/interfaces/execution-context';
import { ReflectMetadataProvider } from '../../providers/reflect-metadata.provider';
import { DiscordClientService } from '../../services/discord-client.service';
import { CollectorResolver } from '../collector/use-collectors/collector.resolver';
import { FilterResolver } from '../filter/filter.resolver';
import { GuardResolver } from '../guard/guard.resolver';
import { MethodResolveOptions } from '../interfaces/method-resolve-options';
import { MethodResolver } from '../interfaces/method-resolver';
import { MiddlewareResolver } from '../middleware/middleware.resolver';
import { PipeResolver } from '../pipe/pipe.resolver';

@Injectable()
export class EventResolver implements MethodResolver {
  private readonly logger = new Logger();

  constructor(
    private readonly metadataProvider: ReflectMetadataProvider,
    private readonly discordClientService: DiscordClientService,
    private readonly middlewareResolver: MiddlewareResolver,
    private readonly guardResolver: GuardResolver,
    private readonly filterResolver: FilterResolver,
    private readonly pipeResolver: PipeResolver,
    private readonly collectorResolver: CollectorResolver,
  ) {}

  async resolve(options: MethodResolveOptions): Promise<void> {
    const { instance, methodName } = options;
    let eventMethod: 'on' | 'once' = 'on';
    let metadata = this.metadataProvider.getOnEventDecoratorMetadata(
      instance,
      methodName,
    );
    if (!metadata) {
      metadata = this.metadataProvider.getOnceEventDecoratorMetadata(
        instance,
        methodName,
      );
      eventMethod = 'once';
      if (!metadata) return;
    }
    const { event } = metadata;
    this.logger.log(
      `Subscribe to event(${eventMethod}): ${event}`,
      instance.constructor.name,
    );

    this.discordClientService
      .getClient()
      [eventMethod](
        event,
        async (...eventArgs: ClientEvents[keyof ClientEvents]) => {
          try {
            //#region apply middleware, guard, pipe
            await this.middlewareResolver.applyMiddleware(event, eventArgs);
            const isAllowFromGuards = await this.guardResolver.applyGuard({
              instance,
              methodName,
              event,
              eventArgs,
            });
            if (!isAllowFromGuards) return;

            const pipeResult = await this.pipeResolver.applyPipe({
              instance,
              methodName,
              event,
              eventArgs,
              initValue: eventArgs,
            });
            //#endregion

            const collectors = await this.collectorResolver.applyCollector({
              instance,
              methodName,
              event,
              eventArgs,
            });

            const executionContext: ExecutionContext = {
              collectors,
            };

            await instance[methodName](
              ...(pipeResult || eventArgs),
              executionContext,
            );
          } catch (exception) {
            const isTrowException = await this.filterResolver.applyFilter({
              instance,
              methodName,
              event,
              eventArgs,
              exception,
            });

            if (isTrowException) throw exception;
          }
        },
      );
  }
}
