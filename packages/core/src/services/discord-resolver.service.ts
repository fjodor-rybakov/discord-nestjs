import { Injectable, OnModuleInit } from '@nestjs/common';
import { DiscoveryService, MetadataScanner } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';

import { DISCORD_APP_FILTER } from '../definitions/constants/discord-app-filter';
import { DISCORD_APP_GUARD } from '../definitions/constants/discord-app-guard';
import { DISCORD_APP_PIPE } from '../definitions/constants/discord-app-pipe';
import { CollectorResolver } from '../resolvers/collector/collector.resolver';
import { CommandResolver } from '../resolvers/command/command.resolver';
import { EventResolver } from '../resolvers/event/event.resolver';
import { FilterResolver } from '../resolvers/filter/filter.resolver';
import { GuardResolver } from '../resolvers/guard/guard.resolver';
import { MethodResolver } from '../resolvers/interfaces/method-resolver';
import { MiddlewareResolver } from '../resolvers/middleware/middleware.resolver';
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
    private readonly eventResolver: EventResolver,
    private readonly guardResolver: GuardResolver,
    private readonly pipeResolver: PipeResolver,
    private readonly middlewareResolver: MiddlewareResolver,
    private readonly commandResolver: CommandResolver,
    private readonly discordOptionService: DiscordOptionService,
    private readonly registerCommandService: RegisterCommandService,
    private readonly collectorResolver: CollectorResolver,
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

    const restProviders = providers.filter(
      ({ token, instance }: InstanceWrapper) => {
        if (typeof token === 'string') {
          const [globalToken] = token.split(':');
          if (globalToken)
            switch (globalToken) {
              case DISCORD_APP_PIPE:
                return !this.discordOptionService.addPipe(instance);
              case DISCORD_APP_GUARD:
                return !this.discordOptionService.addGuard(instance);
              case DISCORD_APP_FILTER:
                return !this.discordOptionService.addFilter(instance);
            }
        }

        return true;
      },
    );

    const methodResolvers = [this.eventResolver, this.prefixCommandResolver];

    const classResolvers = [this.commandResolver, this.middlewareResolver];

    const lifecyclePartsResolvers: MethodResolver[] = [
      this.guardResolver,
      this.pipeResolver,
      this.filterResolver,
    ];

    await Promise.all(
      restProviders
        .concat(controllers)
        .map(async ({ instance }: InstanceWrapper) => {
          if (!instance || !IsObject(instance)) return;

          for await (const resolver of classResolvers)
            await resolver.resolve({ instance });

          const methodNames = this.scanMetadata(instance);

          await Promise.all(
            lifecyclePartsResolvers
              .concat([this.collectorResolver])
              .map(async (resolver) => {
                if (methodNames.length)
                  for await (const methodName of methodNames)
                    await resolver.resolve({ instance, methodName });

                return resolver.resolve({ instance });
              }),
          );

          for await (const resolver of methodResolvers)
            await Promise.all(
              methodNames.map((methodName) =>
                resolver.resolve({
                  instance,
                  methodName,
                }),
              ),
            );
        }),
    );

    await Promise.all(
      this.collectorResolver.getInitCollectorInstances().map((instance) =>
        lifecyclePartsResolvers.map(async (resolver) => {
          const methodNames = this.scanMetadata(instance);

          if (methodNames.length)
            for await (const methodName of methodNames)
              await resolver.resolve({ instance, methodName });

          return resolver.resolve({ instance });
        }),
      ),
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
