import { Injectable, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { MethodResolver } from '../interfaces/method-resolver';
import { DiscordGuardList } from './discord-guard-list';
import { ReflectMetadataProvider } from '../../providers/reflect-metadata.provider';
import { MethodResolveOptions } from '../interfaces/method-resolve-options';
import { GuardType } from '../../definitions/types/guard.type';
import { DiscordGuard } from '../../decorators/guard/discord-guard';
import { DiscordGuardOptions } from './discord-guard-options';
import { DiscordOptionService } from '../../services/discord-option.service';

@Injectable()
export class GuardResolver implements MethodResolver {
  private readonly guardList: DiscordGuardList[] = [];

  constructor(
    private readonly metadataProvider: ReflectMetadataProvider,
    private readonly moduleRef: ModuleRef,
    private readonly discordOptionService: DiscordOptionService,
  ) {}

  async resolve(options: MethodResolveOptions): Promise<void> {
    const { instance, methodName } = options;
    let guards = this.metadataProvider.getUseGuardsDecoratorMetadata(
      instance,
      methodName,
    );
    if (!guards) {
      const hasMetadataForGuard = this.checkApplyGlobalGuard(options);
      if (!hasMetadataForGuard) {
        return;
      }
      const guardAlreadyRegistered = this.getGuardData(options);
      if (guardAlreadyRegistered) {
        return;
      }
      guards = this.discordOptionService.getClientData().useGuards;
      if (guards.length === 0) {
        return;
      }
    }
    await this.addGuard(options, guards);
  }

  async addGuard(
    options: MethodResolveOptions,
    guards: GuardType[],
  ): Promise<void> {
    const { instance, methodName } = options;
    const guardListForMethod: DiscordGuard[] = [];
    for await (const guard of guards) {
      const classType =
        typeof guard === 'function' ? guard : (guard.constructor as Type);
      const newGuardInstance = await this.moduleRef.create(classType);
      guardListForMethod.push(newGuardInstance);
    }
    this.guardList.push({
      instance,
      methodName,
      guardList: guardListForMethod,
    });
  }

  async applyGuard(options: DiscordGuardOptions): Promise<boolean> {
    const { instance, methodName, event, context } = options;
    const guardListForMethod = this.getGuardData({ instance, methodName });
    if (!guardListForMethod) {
      return true;
    }
    for await (const guard of guardListForMethod.guardList) {
      const result = await guard.canActive(event, context);
      if (!result) {
        return false;
      }
    }
    return true;
  }

  private checkApplyGlobalGuard({
    instance,
    methodName,
  }: MethodResolveOptions): boolean {
    const someClassHasMetadata = [
      this.metadataProvider.getCommandDecoratorMetadata,
      this.metadataProvider.getSubCommandDecoratorMetadata,
    ].some((item) => item(instance));

    if (someClassHasMetadata) {
      return true;
    }

    return [
      this.metadataProvider.getOnEventDecoratorMetadata,
      this.metadataProvider.getOnceEventDecoratorMetadata,
    ].some((item) => item(instance, methodName));
  }

  private getGuardData({
    instance,
    methodName,
  }: MethodResolveOptions): DiscordGuardList {
    return this.guardList.find(
      (item: DiscordGuardList) =>
        item.methodName === methodName && item.instance === instance,
    );
  }
}
