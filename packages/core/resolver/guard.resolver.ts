import { Injectable } from '@nestjs/common';
import { ReflectMetadataProvider } from '../provider/reflect-metadata.provider';
import { ModuleRef } from '@nestjs/core';
import { DiscordGuard } from '../decorator/interface/discord-guard';
import { DiscordGuardOptions } from './interface/discord-guard-options';
import { DiscordGuardList } from './interface/discord-guard-list';
import { MethodResolveOptions } from './interface/method-resolve-options';
import { MethodResolver } from './interface/method-resolver';
import { GuardType } from '../util/type/guard-type';
import { DiscordService } from '../service/discord.service';
import { ConstructorType } from '../util/type/constructor-type';

@Injectable()
export class GuardResolver implements MethodResolver {
  private readonly guardList: DiscordGuardList[] = [];

  constructor(
    private readonly metadataProvider: ReflectMetadataProvider,
    private readonly moduleRef: ModuleRef,
    private readonly discordService: DiscordService,
  ) {
  }

  async resolve(options: MethodResolveOptions): Promise<void> {
    const { instance, methodName } = options;
    let guards = this.metadataProvider.getUseGuardsDecoratorMetadata(
      instance,
      methodName,
    );
    if (!guards) {
      const onCommandMetadata = this.metadataProvider.getOnCommandDecoratorMetadata(instance, methodName);
      const onMessageMetadata = this.metadataProvider.getOnMessageDecoratorMetadata(instance, methodName);
      const onceMessageMetadata = this.metadataProvider.getOnceMessageDecoratorMetadata(instance, methodName);
      if (!onCommandMetadata && !onMessageMetadata && !onceMessageMetadata) {
        return;
      }
      const guardsListForMethod = this.guardList.find(
        (item: DiscordGuardList) => item.methodName === methodName && item.instance === instance,
      );
      if (guardsListForMethod) {
        return;
      }
      guards = this.discordService.getGuards();
      if (guards.length === 0) {
        return;
      }
    }
    await this.addGuard(options, guards);
  }

  async addGuard(options: MethodResolveOptions, guards: GuardType[]): Promise<void> {
    const { instance, methodName } = options;
    const guardListForMethod: DiscordGuard[] = [];
    for await(const guard of guards) {
      const classType = typeof guard === 'function' ? guard : guard.constructor as ConstructorType;
      const newGuardInstance = await this.moduleRef.create(classType);
      guardListForMethod.push(newGuardInstance);
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