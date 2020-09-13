import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { DiscoveryService, MetadataScanner } from '@nestjs/core';
import { DiscordResolve } from './interface/discord-resolve';
import { OnCommandResolver } from './resolver/on-command.resolver';
import { OnResolver } from './resolver/on.resolver';
import { DiscordClient } from './discord-client';
import { OnceResolver } from './resolver/once.resolver';
import { MIDDLEWARE_DECORATOR } from './constant/discord.constant';
import { DiscordMiddlewareInstance } from './interface/discord-middleware-instance';

@Injectable()
export class DiscordService implements OnApplicationBootstrap {
  private readonly middlewareList: DiscordMiddlewareInstance[] = [];

  private readonly resolverList: DiscordResolve[] = [
    new OnCommandResolver(),
    new OnResolver(),
    new OnceResolver()
  ];

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly discordClient: DiscordClient
  ) {
  }

  onApplicationBootstrap(): void {
    this.resolveMiddleware();
    this.resolve();
  }

  resolve(): void {
    const providers: InstanceWrapper[] = this.discoveryService.getProviders();
    const controllers: InstanceWrapper[] = this.discoveryService.getControllers();
    providers.concat(controllers).map((wrapper: InstanceWrapper) => {
      const { instance } = wrapper;
      if (instance) {
        this.metadataScanner.scanFromPrototype(instance, Object.getPrototypeOf(instance), (methodName?: string) => {
          this.resolverList.map((item: DiscordResolve) => {
            item.resolve({
              instance,
              methodName,
              discordClient: this.discordClient,
              middlewareList: this.middlewareList
            });
          });
        });
      }
    });
  }

  resolveMiddleware(): void {
    const providers: InstanceWrapper[] = this.discoveryService.getProviders();
    providers.map((wrapper: InstanceWrapper) => {
      const { instance } = wrapper;
      if (instance) {
        const metadata = Reflect.getMetadata(MIDDLEWARE_DECORATOR, instance);
        if (metadata) {
          this.middlewareList.push({ instance, metadata });
        }
      }
    });
  }
}
