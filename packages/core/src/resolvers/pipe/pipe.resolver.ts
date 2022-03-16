import { Injectable, Scope, Type } from '@nestjs/common';
import { SCOPE_OPTIONS_METADATA } from '@nestjs/common/constants';
import { DiscoveryService, ModuleRef } from '@nestjs/core';

import { DiscordPipeTransform } from '../../decorators/pipe/discord-pipe-transform';
import { PipeType } from '../../definitions/types/pipe.type';
import { ReflectMetadataProvider } from '../../providers/reflect-metadata.provider';
import { DiscordOptionService } from '../../services/discord-option.service';
import { MethodResolveOptions } from '../interfaces/method-resolve-options';
import { MethodResolver } from '../interfaces/method-resolver';
import { DiscordPipeList } from './discord-pipe-list';
import { DiscordPipeOptions } from './discord-pipe-options';

@Injectable()
export class PipeResolver implements MethodResolver {
  private readonly pipeList: DiscordPipeList[] = [];

  constructor(
    private readonly metadataProvider: ReflectMetadataProvider,
    private readonly discordOptionService: DiscordOptionService,
    private readonly discoveryService: DiscoveryService,
  ) {}

  async resolve(options: MethodResolveOptions): Promise<void> {
    const { instance, methodName } = options;
    let pipes = this.metadataProvider.getUsePipesDecoratorMetadata(
      instance,
      methodName,
    );
    if (!pipes) {
      const hasMetadataForPipe = this.checkApplyGlobalPipe(options);
      if (!hasMetadataForPipe) return;

      const pipeAlreadyRegistered = this.getPipeData(options);
      if (pipeAlreadyRegistered) return;

      pipes = this.discordOptionService.getClientData().usePipes;
      if (pipes.length === 0) return;
    }
    await this.addPipe(options, pipes);
  }

  async addPipe(
    options: MethodResolveOptions,
    pipes: PipeType[],
  ): Promise<void> {
    const { instance, methodName } = options;

    const instanceWrapper = this.discoveryService
      .getProviders()
      .find(({ token }) => token === instance.constructor);

    if (!instanceWrapper?.host)
      throw new Error(
        `Not found module for ${instance.constructor.name} class`,
      );

    const pipeList = await Promise.all(
      pipes.map((pipe) => {
        if (typeof pipe !== 'function') return pipe;

        return instanceWrapper.host
          .getProviderByKey(ModuleRef)
          .instance.create(pipe);
      }),
    );

    this.pipeList.push({
      instance,
      methodName,
      pipeList,
    });
  }

  async applyPipe(options: DiscordPipeOptions): Promise<any> {
    const {
      instance,
      methodName,
      event,
      eventArgs,
      initValue,
      metatype,
      commandNode,
    } = options;
    const pipesListForMethod = this.getPipeData({ instance, methodName });
    if (!pipesListForMethod) return;

    return pipesListForMethod.pipeList.reduce(
      async (prev: Promise<any>, curr: DiscordPipeTransform) => {
        const prevData = await prev;
        return curr.transform(prevData, {
          event,
          eventArgs,
          metatype,
          commandNode,
        });
      },
      Promise.resolve(initValue),
    );
  }

  private checkApplyGlobalPipe({
    instance,
    methodName,
  }: MethodResolveOptions): boolean {
    const someClassHasMetadata = [
      this.metadataProvider.getCommandDecoratorMetadata,
      this.metadataProvider.getSubCommandDecoratorMetadata,
    ].some((item) => item(instance));

    if (someClassHasMetadata) return true;

    return [
      this.metadataProvider.getOnEventDecoratorMetadata,
      this.metadataProvider.getOnceEventDecoratorMetadata,
    ].some((item) => item(instance, methodName));
  }

  private getPipeData({
    instance,
    methodName,
  }: MethodResolveOptions): DiscordPipeList {
    return this.pipeList.find(
      (item: DiscordPipeList) =>
        item.methodName === methodName && item.instance === instance,
    );
  }

  private getClassScope(provider: Type<unknown>): Scope {
    const metadata = Reflect.getMetadata(SCOPE_OPTIONS_METADATA, provider);
    return metadata && metadata.scope;
  }
}
