import { ForbiddenException, Injectable, Scope } from '@nestjs/common';
import { ContextIdFactory, ModuleRef } from '@nestjs/core';
import { ExternalContextCreator } from '@nestjs/core/helpers/external-context-creator';
import { Collector } from 'discord.js';

import { EVENT_PARAMS_DECORATOR } from '../../decorators/param/event-param.constant';
import { RequestPayload } from '../../definitions/interfaces/request-payload';
import { DiscordParamFactory } from '../../factory/discord-param-factory';
import { OptionService } from '../../services/option.service';
import { CollectMethodEventsInfo } from './collect-method-events-info';

@Injectable()
export class CollectorRegister {
  constructor(
    private readonly externalContextCreator: ExternalContextCreator,
    private readonly optionService: OptionService,
  ) {}

  private readonly discordParamFactory = new DiscordParamFactory();

  subscribeToEvents(
    collector: Collector<any, any, any>,
    events: CollectMethodEventsInfo,
    classInstance: InstanceType<any>,
  ): void {
    Object.entries(events).forEach(
      ([methodName, { eventMethod, eventName }]) => {
        const handler = this.externalContextCreator.create(
          classInstance,
          classInstance[methodName],
          methodName,
          EVENT_PARAMS_DECORATOR,
          this.discordParamFactory,
        );

        collector[eventMethod](eventName as any, async (...eventArgs) => {
          try {
            await handler(...eventArgs);
          } catch (exception) {
            if (
              exception instanceof ForbiddenException &&
              this.optionService.getClientData().isTrowForbiddenException
            )
              throw exception;
          }
        });
      },
    );
  }

  async registerRequest(
    moduleRef: ModuleRef,
    classInstance: InstanceType<any>,
    requestObject: RequestPayload,
  ): Promise<InstanceType<any>> {
    if (moduleRef.introspect(classInstance.constructor).scope === Scope.DEFAULT)
      return classInstance;

    const contextId = ContextIdFactory.create();
    moduleRef.registerRequestByContextId(requestObject, contextId);

    return moduleRef.resolve(classInstance.constructor, contextId);
  }
}
