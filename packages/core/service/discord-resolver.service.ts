import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { DiscoveryService, MetadataScanner } from '@nestjs/core';
import { GuardResolver } from '../resolver/guard.resolver';
import { OnCommandResolver } from '../resolver/on-command.resolver';
import { IsObject } from '../util/function/is-object';
import { PipeResolver } from '../resolver/pipe.resolver';
import { MiddlewareResolver } from '../resolver/middleware.resolver';
import { ParamResolver } from '../resolver/param.resolver';
import { OnEventResolver } from '../resolver/on-event.resolver';
import { OnceEventResolver } from '../resolver/once-event.resolver';
import { ClientResolver } from '../resolver/client.resolver';
import { TransformParamResolver } from '../resolver/transform-param.resolver';

@Injectable()
export class DiscordResolverService implements OnApplicationBootstrap {
  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly guardResolver: GuardResolver,
    private readonly metadataScanner: MetadataScanner,
    private readonly onCommandResolver: OnCommandResolver,
    private readonly pipeResolver: PipeResolver,
    private readonly middlewareResolver: MiddlewareResolver,
    private readonly paramResolver: ParamResolver,
    private readonly onMessageResolver: OnEventResolver,
    private readonly onceMessageResolver: OnceEventResolver,
    private readonly clientResolver: ClientResolver,
    private readonly transformParamResolver: TransformParamResolver,
  ) {
  }

  async onApplicationBootstrap(): Promise<void> {
    const providers: InstanceWrapper[] = this.discoveryService.getProviders();
    const controllers: InstanceWrapper[] = this.discoveryService.getControllers();
    await this.resolveDecorators(providers, controllers);
  }

  private resolveDecorators(providers: InstanceWrapper[], controllers: InstanceWrapper[]) {
    const methodResolvers = [
      this.guardResolver,
      this.onMessageResolver,
      this.onCommandResolver,
      this.onceMessageResolver,
      this.pipeResolver,
      this.paramResolver,
      this.transformParamResolver
    ];
    return Promise.all(providers.concat(controllers).map((instanceWrapper: InstanceWrapper) => {
      const { instance } = instanceWrapper;
      if (!instance || !IsObject(instance)) {
        return;
      }
      this.clientResolver.resolve({ instance });
      this.middlewareResolver.resolve({ instance });
      const methodNames = this.scanMetadata(instance);
      return Promise.all(methodNames.map(async (methodName: string) => {
        for await (const resolver of methodResolvers) {
          await resolver.resolve({
            instance,
            methodName,
          });
        }
      }));
    }));
  }

  private scanMetadata(
    instance: any,
  ): string[] {
    return this.metadataScanner.scanFromPrototype(
      instance,
      Object.getPrototypeOf(instance),
      (methodName: string) => methodName,
    );
  }
}