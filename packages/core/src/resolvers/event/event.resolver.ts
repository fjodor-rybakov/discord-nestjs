import { ReflectMetadataProvider } from '../../providers/reflect-metadata.provider';
import { DiscordClientService } from '../../services/discord-client.service';
import { GuardResolver } from '../guard/guard.resolver';
import { MethodResolveOptions } from '../interfaces/method-resolve-options';
import { MethodResolver } from '../interfaces/method-resolver';
import { MiddlewareResolver } from '../middleware/middleware.resolver';
import { Injectable, Logger } from '@nestjs/common';
import { ClientEvents } from 'discord.js';

@Injectable()
export class EventResolver implements MethodResolver {
  private readonly logger = new Logger();

  constructor(
    private readonly metadataProvider: ReflectMetadataProvider,
    private readonly discordClientService: DiscordClientService,
    private readonly middlewareResolver: MiddlewareResolver,
    private readonly guardResolver: GuardResolver,
  ) {}

  resolve(options: MethodResolveOptions): void {
    const { instance, methodName } = options;
    let metadata = this.metadataProvider.getOnEventDecoratorMetadata(
      instance,
      methodName,
    );
    if (!metadata) {
      metadata = this.metadataProvider.getOnceEventDecoratorMetadata(
        instance,
        methodName,
      );
      if (!metadata) return;
    }
    const { event } = metadata;
    this.logger.log(`Subscribe to event: ${event}`, instance.constructor.name);
    this.discordClientService
      .getClient()
      .on(event, async (...data: ClientEvents[keyof ClientEvents]) => {
        //#region apply middleware, guard, pipe
        const context = data;
        await this.middlewareResolver.applyMiddleware(event, context);
        const isAllowFromGuards = await this.guardResolver.applyGuard({
          instance,
          methodName,
          event,
          context,
        });
        if (!isAllowFromGuards) {
          return;
        }

        //#endregion

        await instance[methodName](...context);
      });
  }
}
