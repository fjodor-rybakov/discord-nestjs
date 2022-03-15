import { Injectable, OnModuleInit } from '@nestjs/common';
import { DiscoveryService, MetadataScanner } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';

import { BaseCollectorResolver } from '../resolvers/collector/base-collector.resolver';
import { CollectorClassResolver } from '../resolvers/collector/collector-class.resolver';
import { CollectorResolver } from '../resolvers/collector/use-collectors/collector.resolver';
import { CommandResolver } from '../resolvers/command/command.resolver';
import { EventResolver } from '../resolvers/event/event.resolver';
import { FilterClassResolver } from '../resolvers/filter/filter-class.resolver';
import { FilterResolver } from '../resolvers/filter/filter.resolver';
import { GuardClassResolver } from '../resolvers/guard/guard-class.resolver';
import { GuardResolver } from '../resolvers/guard/guard.resolver';
import { MiddlewareResolver } from '../resolvers/middleware/middleware.resolver';
import { ParamResolver } from '../resolvers/param/param.resolver';
import { PipeClassResolver } from '../resolvers/pipe/pipe-class.resolver';
import { PipeResolver } from '../resolvers/pipe/pipe.resolver';
import { PrefixCommandResolver } from '../resolvers/prefix-command/prefix-command.resolver';
import { IsObject } from '../utils/function/is-object';
import { DiscordOptionService } from './discord-option.service';
import { RegisterCommandService } from './register-command.service';

@Injectable()
export class DiscordResolverService implements OnModuleInit {
  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly filterResolver: FilterResolver,
    private readonly filterClassResolver: FilterClassResolver,
    private readonly eventResolver: EventResolver,
    private readonly guardResolver: GuardResolver,
    private readonly pipeResolver: PipeResolver,
    private readonly middlewareResolver: MiddlewareResolver,
    private readonly guardClassResolver: GuardClassResolver,
    private readonly pipeClassResolver: PipeClassResolver,
    private readonly paramResolver: ParamResolver,
    private readonly commandResolver: CommandResolver,
    private readonly discordOptionService: DiscordOptionService,
    private readonly registerCommandService: RegisterCommandService,
    private readonly collectorResolver: CollectorResolver,
    private readonly collectorClassResolver: CollectorClassResolver,
    private readonly baseCollectorResolver: BaseCollectorResolver,
    private readonly prefixCommandResolver: PrefixCommandResolver,
  ) {}

  async onModuleInit(): Promise<void> {
    const providers: InstanceWrapper[] = this.discoveryService.getProviders();
    const controllers: InstanceWrapper[] =
      this.discoveryService.getControllers();
    await this.resolveDecorators(providers, controllers);
  }

  private async resolveDecorators(
    providers: InstanceWrapper[],
    controllers: InstanceWrapper[],
  ): Promise<void> {
    const options = this.discordOptionService.getClientData();

    const methodResolvers = [
      this.filterResolver,
      this.paramResolver,
      this.collectorResolver,
      this.guardResolver,
      this.pipeResolver,
      this.eventResolver,
      this.prefixCommandResolver,
    ];

    const classResolvers = [
      this.commandResolver,
      this.filterClassResolver,
      this.baseCollectorResolver,
      this.middlewareResolver,
      this.guardClassResolver,
      this.pipeClassResolver,
      this.collectorClassResolver,
    ];

    await Promise.all(
      providers.concat(controllers).map(async (instanceWrapper: any) => {
        let instance = instanceWrapper;
        if (instanceWrapper instanceof InstanceWrapper)
          instance = instanceWrapper.instance;
        if (!instance || !IsObject(instance)) return;

        for await (const resolver of classResolvers)
          await resolver.resolve({ instance });

        const methodNames = this.scanMetadata(instance);
        await Promise.all(
          methodNames.map(async (methodName: string) => {
            for await (const resolver of methodResolvers) {
              await resolver.resolve({
                instance,
                methodName,
              });
            }
          }),
        );
      }),
    );

    await this.registerCommandService.register(options);
  }

  private scanMetadata(instance: any): string[] {
    return this.metadataScanner.scanFromPrototype(
      instance,
      Object.getPrototypeOf(instance),
      (methodName) => methodName,
    );
  }
}
