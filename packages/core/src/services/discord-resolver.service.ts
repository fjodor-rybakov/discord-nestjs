import { Injectable, OnModuleInit } from '@nestjs/common';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { DiscoveryService, MetadataScanner } from '@nestjs/core';
import { IsObject } from '../utils/function/is-object';
import { EventResolver } from '../resolvers/event/event.resolver';
import { MiddlewareResolver } from '../resolvers/middleware/middleware.resolver';
import { PipeResolver } from '../resolvers/pipe/pipe.resolver';
import { GuardResolver } from '../resolvers/guard/guard.resolver';
import { GuardClassResolver } from '../resolvers/guard/guard-class.resolver';
import { PipeClassResolver } from '../resolvers/pipe/pipe-class.resolver';
import { CommandResolver } from '../resolvers/command/command.resolver';
import { DiscordCommandStore } from '../store/discord-command-store';
import { DiscordClientService } from './discord-client.service';
import { Client } from 'discord.js';

@Injectable()
export class DiscordResolverService implements OnModuleInit {
  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly eventResolver: EventResolver,
    private readonly guardResolver: GuardResolver,
    private readonly pipeResolver: PipeResolver,
    private readonly middlewareResolver: MiddlewareResolver,
    private readonly guardClassResolver: GuardClassResolver,
    private readonly pipeClassResolver: PipeClassResolver,
    private readonly commandResolver: CommandResolver,
    private readonly discordCommandStore: DiscordCommandStore,
    private readonly discordClientService: DiscordClientService,
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
    const classResolvers = [
      this.middlewareResolver,
      this.guardClassResolver,
      this.pipeClassResolver,
    ];
    const methodResolvers = [
      this.eventResolver,
      this.guardResolver,
      this.pipeResolver,
      this.commandResolver,
    ];
    await Promise.all(
      providers
        .concat(controllers)
        .map(async (instanceWrapper: InstanceWrapper) => {
          const { instance } = instanceWrapper;
          if (!instance || !IsObject(instance)) {
            return;
          }
          for await (const resolver of classResolvers) {
            await resolver.resolve({ instance });
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
        }),
    );

    const client = await this.discordClientService.getClient();

    client.on('ready', () => this.registerCommands(client));
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
  }
}
