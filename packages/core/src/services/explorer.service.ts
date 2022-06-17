import { Injectable, OnModuleInit } from '@nestjs/common';
import { DiscoveryService, MetadataScanner } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';

import { DISCORD_APP_FILTER } from '../definitions/constants/discord-app-filter';
import { DISCORD_APP_GUARD } from '../definitions/constants/discord-app-guard';
import { DISCORD_APP_PIPE } from '../definitions/constants/discord-app-pipe';
import { CollectorExplorer } from '../explorers/collector/collector.explorer';
import { CommandExplorer } from '../explorers/command/command.explorer';
import { EventExplorer } from '../explorers/event/event.explorer';
import { FilterExplorer } from '../explorers/filter/filter.explorer';
import { GuardExplorer } from '../explorers/guard/guard.explorer';
import { ClassExplorer } from '../explorers/interfaces/class-explorer';
import { MethodExplorer } from '../explorers/interfaces/method-explorer';
import { MiddlewareExplorer } from '../explorers/middleware/middleware.explorer';
import { PipeExplorer } from '../explorers/pipe/pipe.explorer';
import { PrefixCommandExplorer } from '../explorers/prefix-command/prefix-command.explorer';
import { IsObject } from '../utils/function/is-object';
import { GlobalProviderService } from './global-provider.service';
import { OptionService } from './option.service';
import { RegisterCommandService } from './register-command.service';

@Injectable()
export class ExplorerService implements OnModuleInit {
  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly filterExplorer: FilterExplorer,
    private readonly eventExplorer: EventExplorer,
    private readonly guardExplorer: GuardExplorer,
    private readonly pipeExplorer: PipeExplorer,
    private readonly middlewareExplorer: MiddlewareExplorer,
    private readonly commandExplorer: CommandExplorer,
    private readonly globalProviderService: GlobalProviderService,
    private readonly registerCommandService: RegisterCommandService,
    private readonly collectorExplorer: CollectorExplorer,
    private readonly prefixCommandExplorer: PrefixCommandExplorer,
    private readonly discordOptionService: OptionService,
  ) {}

  async onModuleInit(): Promise<void> {
    const providers: InstanceWrapper[] = this.discoveryService.getProviders();
    const controllers: InstanceWrapper[] =
      this.discoveryService.getControllers();
    await this.exploreDecorators(providers, controllers);
  }

  private async exploreDecorators(
    providers: InstanceWrapper[],
    controllers: InstanceWrapper[],
  ): Promise<void> {
    const { globalLifecycleParts, restProviders } =
      this.globalProviderService.filterGlobalProviders(providers);

    const sortedGlobalProviders =
      this.globalProviderService.sortGlobalProviders(globalLifecycleParts);

    sortedGlobalProviders.forEach(({ token, instance }: InstanceWrapper) => {
      const [globalToken] = (token as string).split(':');

      switch (globalToken) {
        case DISCORD_APP_PIPE:
          return !this.discordOptionService.addPipe(instance);
        case DISCORD_APP_GUARD:
          return !this.discordOptionService.addGuard(instance);
        case DISCORD_APP_FILTER:
          return !this.discordOptionService.addFilter(instance);
      }
    });

    const methodExplorers = [this.eventExplorer, this.prefixCommandExplorer];

    const classExplorers = [this.commandExplorer, this.middlewareExplorer];

    const lifecyclePartsExplorers: MethodExplorer[] = [
      this.guardExplorer,
      this.pipeExplorer,
      this.filterExplorer,
    ];

    await Promise.all(
      restProviders
        .concat(controllers)
        .map(async ({ instance }: InstanceWrapper) => {
          if (!instance || !IsObject(instance)) return;

          await Promise.all(
            classExplorers.map((explorer) => explorer.explore({ instance })),
          );

          const methodNames = this.scanMetadata(instance);

          await this.exploreClassOrMethod(
            lifecyclePartsExplorers.concat([this.collectorExplorer]),
            instance,
            methodNames,
          );

          await Promise.all(
            methodExplorers.map((explorer) =>
              Promise.all(
                methodNames.map((methodName) =>
                  explorer.explore({
                    instance,
                    methodName,
                  }),
                ),
              ),
            ),
          );
        }),
    );

    await Promise.all(
      this.collectorExplorer.getInitCollectorInstances().map((instance) => {
        const methodNames = this.scanMetadata(instance);

        return this.exploreClassOrMethod(
          lifecyclePartsExplorers,
          instance,
          methodNames,
        );
      }),
    );

    await this.registerCommandService.register();
  }

  private exploreClassOrMethod(
    explorers: (MethodExplorer | ClassExplorer)[],
    instance: InstanceType<any>,
    methodNames: string[],
  ): Promise<void[]> {
    return Promise.all(
      explorers.map(async (explorer) => {
        if (methodNames.length)
          for await (const methodName of methodNames)
            await explorer.explore({ instance, methodName });

        await explorer.explore({ instance });
      }),
    );
  }

  private scanMetadata(instance: InstanceType<any>): string[] {
    return this.metadataScanner.scanFromPrototype(
      instance,
      Object.getPrototypeOf(instance),
      (methodName) => methodName,
    );
  }
}
