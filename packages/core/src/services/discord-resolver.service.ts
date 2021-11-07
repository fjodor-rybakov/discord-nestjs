import { Injectable, OnModuleInit, Type } from '@nestjs/common';
import { DiscoveryService, MetadataScanner, ModuleRef } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';

import { DiscordModuleOption } from '../definitions/interfaces/discord-module-options';
import { CommandNode } from '../definitions/types/tree/command-node';
import { Leaf } from '../definitions/types/tree/leaf';
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
import { IsObject } from '../utils/function/is-object';
import { CommandPathToClassService } from './command-path-to-class.service';
import { CommandTreeService } from './command-tree.service';
import { DiscordOptionService } from './discord-option.service';
import { RegisterCommandService } from './register-command.service';

@Injectable()
export class DiscordResolverService implements OnModuleInit {
  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly moduleRef: ModuleRef,
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
    private readonly commandPathToClassService: CommandPathToClassService,
    private readonly commandTreeService: CommandTreeService,
    private readonly registerCommandService: RegisterCommandService,
    private readonly collectorResolver: CollectorResolver,
    private readonly collectorClassResolver: CollectorClassResolver,
    private readonly baseCollectorResolver: BaseCollectorResolver,
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
    const commandInstances = await this.instantiateCommands(options);

    const methodResolvers = [
      this.filterResolver,
      this.paramResolver,
      this.collectorResolver,
      this.guardResolver,
      this.pipeResolver,
      this.eventResolver,
    ];

    const classResolvers = [
      this.filterClassResolver,
      this.baseCollectorResolver,
      this.middlewareResolver,
      this.guardClassResolver,
      this.pipeClassResolver,
      this.collectorClassResolver,
    ];

    await Promise.all(
      providers
        .concat(controllers)
        .concat(commandInstances.flat())
        .map(async (instanceWrapper: any) => {
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

  private async instantiateCommands(
    options: DiscordModuleOption,
  ): Promise<any[]> {
    const commandTypes =
      await this.commandPathToClassService.resolveCommandsType(
        options.commands,
      );

    const commandInstances = await Promise.all(
      commandTypes.map(async (command: Type) => {
        const instance = await this.moduleRef.create(command);
        await this.commandResolver.resolve({ instance });
        const instances: any[] = [];

        const commandNode = Object.values(
          this.commandTreeService.getTree(),
        ).find((node) => node.instance.constructor.name === command.name);

        this.findAllInstancesInTree(commandNode, instances);

        return instances;
      }),
    );

    return commandInstances.flat();
  }

  private scanMetadata(instance: any): string[] {
    return this.metadataScanner.scanFromPrototype(
      instance,
      Object.getPrototypeOf(instance),
      (methodName) => methodName,
    );
  }

  private findAllInstancesInTree(node: CommandNode, instances: any[]): void {
    if (!node) return;
    if (node.instance) instances.push(node.instance);

    const commandsNames = this.getCommandNamesFromNode(node);
    if (commandsNames.length === 0) return;

    commandsNames.forEach((name: string) =>
      this.findAllInstancesInTree(node[name], instances),
    );
  }

  private getCommandNamesFromNode(node: CommandNode): string[] {
    const keys = Object.keys(node);
    const excludeKeys: (keyof Leaf)[] = ['instance', 'dtoInstance'];

    return keys.filter((key: keyof Leaf) => !excludeKeys.includes(key));
  }
}
