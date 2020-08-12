import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Client } from 'discord.js';
import { DiscordModuleOption } from './interface/discord-module-option';
import { DISCORD_MODULE_OPTIONS } from './constant/discord.constant';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { DiscoveryService, MetadataScanner } from '@nestjs/core';
import { DiscordResolve } from './interface/discord-resolve';
import { OnCommandResolver } from './resolver/on-command.resolver';
import { OnResolver } from './resolver/on.resolver';

@Injectable()
export class DiscordService implements OnApplicationBootstrap {
  private readonly resolverList: DiscordResolve[] = [
    new OnCommandResolver(),
    new OnResolver()
  ];

  constructor(
    @Inject(DISCORD_MODULE_OPTIONS)
    private readonly options: DiscordModuleOption,
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly discordClient: Client
  ) {
    this.resolve();
  }

  async onApplicationBootstrap(): Promise<void> {
    await this.discordClient.login(this.options.token);
  }

  resolve(): void {
    const providers: InstanceWrapper[] = this.discoveryService.getProviders();
    providers.map((wrapper: InstanceWrapper) => {
      const { instance } = wrapper;
      if (instance) {
        this.metadataScanner.scanFromPrototype(instance, Object.getPrototypeOf(instance), (methodName: string) => {
          this.resolverList.map((item: DiscordResolve) => {
            item.resolve(instance, methodName, this.discordClient, this.options);
          });
        });
      }
    });
  }
}
