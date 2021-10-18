import { Injectable, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { MethodResolveOptions } from '../interfaces/method-resolve-options';
import { MethodResolver } from '../interfaces/method-resolver';
import { DiscordPipeList } from './discord-pipe-list';
import { DiscordOptionService } from '../../services/discord-option.service';
import { PipeType } from '../../definitions/types/pipe.type';
import { DiscordPipeTransform } from '../../decorators/pipe/discord-pipe-transform';
import { DiscordPipeOptions } from './discord-pipe-options';
import { ReflectMetadataProvider } from '../../providers/reflect-metadata.provider';

@Injectable()
export class PipeResolver implements MethodResolver {
  private readonly pipeList: DiscordPipeList[] = [];

  constructor(
    private readonly metadataProvider: ReflectMetadataProvider,
    private readonly moduleRef: ModuleRef,
    private readonly discordOptionService: DiscordOptionService,
  ) {}

  async resolve(options: MethodResolveOptions): Promise<void> {
    const { instance, methodName } = options;
    let pipes = this.metadataProvider.getUsePipesDecoratorMetadata(
      instance,
      methodName,
    );
    if (!pipes) {
      const hasMetadataForPipe = this.checkApplyGlobalPipe(options);
      if (!hasMetadataForPipe) {
        return;
      }
      const pipeAlreadyRegistered = this.getPipeData(options);
      if (pipeAlreadyRegistered) {
        return;
      }
      pipes = this.discordOptionService.getClientData().usePipes;
      if (pipes.length === 0) {
        return;
      }
    }
    await this.addPipe(options, pipes);
  }

  async addPipe(
    options: MethodResolveOptions,
    pipes: PipeType[],
  ): Promise<void> {
    const { instance, methodName } = options;
    const pipeListForMethod: DiscordPipeTransform[] = [];
    for await (const pipe of pipes) {
      const classType =
        typeof pipe === 'function' ? pipe : (pipe.constructor as Type);
      const newPipeInstance = await this.moduleRef.create(classType);
      if (typeof pipe !== 'function') {
        // resolve constructor params
        newPipeInstance.validateOptions = pipe['validateOptions'];
      }
      pipeListForMethod.push(newPipeInstance);
    }
    this.pipeList.push({
      instance,
      methodName,
      pipeList: pipeListForMethod,
    });
  }

  async applyPipe(options: DiscordPipeOptions): Promise<any> {
    const {
      instance,
      methodName,
      event,
      context,
      initValue,
      metatype,
      commandNode,
    } = options;
    const pipesListForMethod = this.getPipeData({ instance, methodName });
    if (!pipesListForMethod) {
      return;
    }
    return pipesListForMethod.pipeList.reduce(
      async (prev: Promise<any>, curr: DiscordPipeTransform) => {
        const prevData = await prev;
        return curr.transform(prevData, {
          event,
          context,
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

    if (someClassHasMetadata) {
      return true;
    }

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
}
