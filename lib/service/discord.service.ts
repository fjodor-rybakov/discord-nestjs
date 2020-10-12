import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { DiscoveryService, MetadataScanner } from '@nestjs/core';
import { DiscordResolve } from '../interface/discord-resolve';
import { OnCommandResolver } from '../resolver/on-command.resolver';
import { OnResolver } from '../resolver/on.resolver';
import { DiscordClient } from '../discord-client';
import { OnceResolver } from '../resolver/once.resolver';
import { DiscordMiddlewareInstance } from '../interface/discord-middleware-instance';
import { DiscordMiddlewareService } from './discord-middleware.service';

@Injectable()
export class DiscordService implements OnApplicationBootstrap {
  private readonly resolverList: DiscordResolve[];

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly discordClient: DiscordClient,
    private readonly discordMiddlewareService: DiscordMiddlewareService,
    private readonly commandResolver: OnCommandResolver,
    private readonly onResolver: OnResolver,
    private readonly onceResolver: OnceResolver,
  ) {
    this.resolverList = [
      commandResolver,
      onResolver,
      onceResolver
    ];
  }

  onApplicationBootstrap(): void {
    const providers: InstanceWrapper[] = this.discoveryService.getProviders();
    const controllers: InstanceWrapper[] = this.discoveryService.getControllers();
    const middlewareList = this.discordMiddlewareService.resolveMiddleware(providers);
    this.resolve(providers, controllers, middlewareList);
  }

  resolve(
    providers: InstanceWrapper[],
    controllers: InstanceWrapper[],
    middlewareList: DiscordMiddlewareInstance[]
  ): void {
    providers.concat(controllers).forEach((wrapper: InstanceWrapper) => {
      const { instance } = wrapper;
      if (instance) {
        this.scanMetadata(instance, middlewareList);
      }
    });
  }

  private scanMetadata(
    instance: any,
    middlewareList: DiscordMiddlewareInstance[]
  ): void {
    this.metadataScanner.scanFromPrototype(instance, Object.getPrototypeOf(instance), (methodName: string) => {
      this.resolverList.forEach((item: DiscordResolve) => {
        item.resolve({
          instance,
          methodName,
          discordClient: this.discordClient,
          middlewareList
        });
      });
    });
  }
}
