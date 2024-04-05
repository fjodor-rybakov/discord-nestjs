import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { ExternalContextCreator } from '@nestjs/core/helpers/external-context-creator';
import { ClientEvents, Message } from 'discord.js';

import { EVENT_PARAMS_DECORATOR } from '../../decorators/param/event-param.constant';
import { EventContext } from '../../definitions/interfaces/event-context';
import { DiscordParamFactory } from '../../factory/discord-param-factory';
import { ReflectMetadataProvider } from '../../providers/reflect-metadata.provider';
import { ClientService } from '../../services/client.service';
import { OptionService } from '../../services/option.service';
import { MethodExplorer } from '../interfaces/method-explorer';
import { MethodExplorerOptions } from '../interfaces/method-explorer-options';

@Injectable()
export class EventExplorer implements MethodExplorer {
  private readonly logger = new Logger();

  constructor(
    private readonly metadataProvider: ReflectMetadataProvider,
    private readonly discordClientService: ClientService,
    private readonly optionService: OptionService,
    private readonly externalContextCreator: ExternalContextCreator,
  ) {}

  private readonly discordParamFactory = new DiscordParamFactory();

  async explore(options: MethodExplorerOptions): Promise<void> {
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

    const handler = this.externalContextCreator.create(
      instance,
      instance[methodName],
      methodName,
      EVENT_PARAMS_DECORATOR,
      this.discordParamFactory,
    );

    this.discordClientService
      .getClient()
      [
        eventMethod
      ](event, async (...eventArgs: ClientEvents[keyof ClientEvents]) => {
        try {
          const response = await handler(...eventArgs, {
            event,
            collectors: [],
          } as EventContext);

          const [eventArg] = eventArgs;

          if (response && this.hasReply(eventArg)) {
            await eventArg['reply'](response);
          }
        } catch (exception) {
          if (
            exception instanceof ForbiddenException &&
            this.optionService.getClientData().isTrowForbiddenException
          )
            throw exception;
        }
      });
  }

  private hasReply(value: any): value is Message {
    return typeof value['reply'] === 'function';
  }
}
