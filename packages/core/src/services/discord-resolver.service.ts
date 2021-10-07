import { Injectable, OnModuleInit, Type } from '@nestjs/common';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { DiscoveryService, MetadataScanner, ModuleRef } from '@nestjs/core';
import { IsObject } from '../utils/function/is-object';
import { EventResolver } from '../resolvers/event/event.resolver';
import { MiddlewareResolver } from '../resolvers/middleware/middleware.resolver';
import { PipeResolver } from '../resolvers/pipe/pipe.resolver';
import { GuardResolver } from '../resolvers/guard/guard.resolver';
import { GuardClassResolver } from '../resolvers/guard/guard-class.resolver';
import { PipeClassResolver } from '../resolvers/pipe/pipe-class.resolver';
import { DiscordCommandStore } from '../store/discord-command-store';
import { DiscordClientService } from './discord-client.service';
import { Client } from 'discord.js';
import { DiscordOptionService } from './discord-option.service';
import { CommandResolver } from '../resolvers/command/command.resolver';
import { ParamResolver } from '../resolvers/param/param.resolver';

@Injectable()
export class DiscordResolverService implements OnModuleInit {
  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly moduleRef: ModuleRef,
    private readonly metadataScanner: MetadataScanner,
    private readonly eventResolver: EventResolver,
    private readonly guardResolver: GuardResolver,
    private readonly pipeResolver: PipeResolver,
    private readonly middlewareResolver: MiddlewareResolver,
    private readonly guardClassResolver: GuardClassResolver,
    private readonly pipeClassResolver: PipeClassResolver,
    private readonly paramResolver: ParamResolver,
    private readonly commandResolver: CommandResolver,
    private readonly discordCommandStore: DiscordCommandStore,
    private readonly discordClientService: DiscordClientService,
    private readonly discordOptionService: DiscordOptionService,
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
    const { commands } = this.discordOptionService.getClientData();
    const methodResolvers = [
      this.paramResolver,
      this.eventResolver,
      this.guardResolver,
      this.pipeResolver,
    ];

    const classResolvers = [
      this.middlewareResolver,
      this.guardClassResolver,
      this.pipeClassResolver,
      this.commandResolver,
    ];

    const commandInstances = await Promise.all(
      commands.map((command: Type) => this.moduleRef.create(command)),
    );
    await Promise.all(
      providers
        .concat(controllers)
        .concat(commandInstances)
        .map(async (instanceWrapper: any) => {
          let instance = instanceWrapper;
          if (instanceWrapper instanceof InstanceWrapper) {
            instance = instanceWrapper.instance;
          }
          if (!instance || !IsObject(instance)) {
            return;
          }

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

          for await (const resolver of classResolvers) {
            await resolver.resolve({ instance });
          }
        }),
    );

    const client = await this.discordClientService.getClient();

    // TODO: Include late
    // client.on('ready', () => this.registerCommands(client));
  }

  private scanMetadata(instance: any): string[] {
    return this.metadataScanner.scanFromPrototype(
      instance,
      Object.getPrototypeOf(instance),
      (methodName) => methodName,
    );
  }

  private async registerCommands(client: Client): Promise<void> {
    const commandList = this.discordCommandStore.getAllCommands();

    await client.application.commands.set(commandList);

    await client.application.commands.fetch();
  }
}
