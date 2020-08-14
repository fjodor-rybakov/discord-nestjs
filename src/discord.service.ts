import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { DiscoveryService, MetadataScanner } from '@nestjs/core';
import { DiscordResolve } from './interface/discord-resolve';
import { OnCommandResolver } from './resolver/on-command.resolver';
import { OnResolver } from './resolver/on.resolver';
import { DiscordClient } from './discord-client';
import { OnceResolver } from './resolver/once.resolver';

@Injectable()
export class DiscordService implements OnApplicationBootstrap {
  private readonly resolverList: DiscordResolve[] = [
    new OnCommandResolver(),
    new OnResolver(),
    new OnceResolver()
  ];

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly discordClient: DiscordClient,
  ) {
  }

  onApplicationBootstrap(): void {
    this.resolve();
  }

  resolve(): void {
    const providers: InstanceWrapper[] = this.discoveryService.getProviders();
    providers.map((wrapper: InstanceWrapper) => {
      const { instance } = wrapper;
      if (instance) {
        this.metadataScanner.scanFromPrototype(instance, Object.getPrototypeOf(instance), (methodName: string) => {
          this.resolverList.map((item: DiscordResolve) => {
            item.resolve(instance, methodName, this.discordClient);
          });
        });
      }
    });
  }
}
