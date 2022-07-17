import { Injectable, Scope } from '@nestjs/common';
import { ContextIdFactory, MetadataScanner, ModuleRef } from '@nestjs/core';
import { Collector } from 'discord.js';

import { ReflectMetadataProvider } from '../../providers/reflect-metadata.provider';
import { FilterExplorer } from '../filter/filter.explorer';
import { GuardExplorer } from '../guard/guard.explorer';
import { MiddlewareExplorer } from '../middleware/middleware.explorer';
import { PipeExplorer } from '../pipe/pipe.explorer';
import { CollectMethodEventsInfo } from './collect-method-events-info';

@Injectable()
export class CollectorRegister {
  constructor(
    private readonly metadataProvider: ReflectMetadataProvider,
    private readonly metadataScanner: MetadataScanner,
    private readonly middlewareExplorer: MiddlewareExplorer,
    private readonly guardExplorer: GuardExplorer,
    private readonly filterExplorer: FilterExplorer,
    private readonly pipeExplorer: PipeExplorer,
  ) {}

  subscribeToEvents(
    collector: Collector<any, any, any>,
    events: CollectMethodEventsInfo,
    classInstance: InstanceType<any>,
  ): void {
    Object.entries(events).forEach(
      ([methodName, { eventMethod, eventName }]) => {
        collector[eventMethod](eventName as any, async (...eventArgs) => {
          try {
            //#region apply middleware, guard, pipe
            await this.middlewareExplorer.applyMiddleware(eventName, eventArgs);
            const isAllowFromGuards = await this.guardExplorer.applyGuard({
              instance: classInstance,
              methodName,
              event: eventName,
              eventArgs,
            });
            if (!isAllowFromGuards) return;

            const pipeResult = await this.pipeExplorer.applyPipe({
              instance: classInstance,
              methodName,
              event: eventName,
              eventArgs,
              initValue: eventArgs,
            });
            //#endregion

            classInstance[methodName](...(pipeResult || eventArgs));
          } catch (exception) {
            const isTrowException = await this.filterExplorer.applyFilter({
              instance: classInstance,
              methodName,
              event: eventName,
              eventArgs,
              exception,
            });

            if (isTrowException) throw exception;
          }
        });
      },
    );
  }

  async registerRequest(
    moduleRef: ModuleRef,
    classInstance: InstanceType<any>,
    requestObject: unknown,
  ): Promise<InstanceType<any>> {
    if (moduleRef.introspect(classInstance.constructor).scope === Scope.DEFAULT)
      return classInstance;

    const contextId = ContextIdFactory.create();
    moduleRef.registerRequestByContextId(requestObject, contextId);

    return moduleRef.resolve(classInstance.constructor, contextId);
  }
}
