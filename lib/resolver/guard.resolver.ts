import { Injectable } from '@nestjs/common';
import { ReflectMetadataProvider } from '../provider/reflect-metadata.provider';
import { ModuleRef } from '@nestjs/core';
import { DiscordGuard } from '../decorator/interface/discord-guard';
import { DiscordGuardOptions } from './interface/discord-guard-options';
import { DiscordGuardList } from './interface/discord-guard-list';
import { MethodResolveOptions } from './interface/method-resolve-options';

@Injectable()
export class GuardResolver {
  private readonly guardList: DiscordGuardList[] = [];

  constructor(
    private readonly metadataProvider: ReflectMetadataProvider,
    private readonly moduleRef: ModuleRef,
  ) {
  }

  async resolve(options: MethodResolveOptions): Promise<void> {
    const { instance, methodName } = options;
    const guards = this.metadataProvider.getUseGuardsDecoratorMetadata(
      instance,
      methodName,
    );
    if (!guards) {
      return;
    }
    const guardListForMethod: DiscordGuard[] = [];
    for await(const guard of guards) {
      if (typeof guard === 'function') {
        const newGuardInstance = await this.moduleRef.create<DiscordGuard>(guard);
        guardListForMethod.push(newGuardInstance);
      } else {
        guardListForMethod.push(guard);
      }
    }
    this.guardList.push({
      instance,
      methodName,
      guardList: guardListForMethod
    });
  }

  async applyGuard(options: DiscordGuardOptions): Promise<boolean> {
    const { instance, methodName, event, context } = options;
    const guardListForMethod = this.guardList.find(
      (item: DiscordGuardList) => item.methodName === methodName && item.instance === instance
    );
    if (!guardListForMethod) {
      return true;
    }
    for await(const guard of guardListForMethod.guardList) {
      const result = await guard.canActive(event, context);
      if (!result) {
        return false;
      }
    }
    return true;
  }
}