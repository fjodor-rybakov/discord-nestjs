import { Injectable, OnModuleInit } from '@nestjs/common';
import { DiscoveryService, MetadataScanner } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';

import { CollectorExplorer } from '../explorers/collector/collector.explorer';
import { CommandExplorer } from '../explorers/command/command.explorer';
import { EventExplorer } from '../explorers/event/event.explorer';
import { ClassExplorer } from '../explorers/interfaces/class-explorer';
import { MethodExplorer } from '../explorers/interfaces/method-explorer';
import { IsObject } from '../utils/function/is-object';
import { RegisterCommandService } from './register-command.service';

@Injectable()
export class ExplorerService implements OnModuleInit {
  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly eventExplorer: EventExplorer,
    private readonly commandExplorer: CommandExplorer,
    private readonly registerCommandService: RegisterCommandService,
    private readonly collectorExplorer: CollectorExplorer,
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
    const methodExplorers = [this.eventExplorer];

    const classExplorers = [this.commandExplorer];

    await Promise.all(
      providers
        .concat(controllers)
        .map(async ({ instance }: InstanceWrapper) => {
          if (!instance || !IsObject(instance)) return;

          await Promise.all(
            classExplorers.map((explorer) => explorer.explore({ instance })),
          );

          const methodNames = this.scanMetadata(instance);

          await this.exploreClassOrMethod(
            [this.collectorExplorer],
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
