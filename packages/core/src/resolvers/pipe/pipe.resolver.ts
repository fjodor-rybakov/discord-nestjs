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
      const commandMetadata = this.metadataProvider.getCommandDecoratorMetadata(
        instance,
        methodName,
      );
      const onEventMetadata = this.metadataProvider.getOnEventDecoratorMetadata(
        instance,
        methodName,
      );
      const onceEventMetadata =
        this.metadataProvider.getOnceEventDecoratorMetadata(
          instance,
          methodName,
        );
      if (!commandMetadata && !onEventMetadata && !onceEventMetadata) {
        return;
      }
      const pipesListForMethod = this.pipeList.find(
        (item: DiscordPipeList) =>
          item.methodName === methodName && item.instance === instance,
      );
      if (pipesListForMethod) {
        return;
      }
      pipes = this.discordOptionService.getClientData().usePipes;
      if (pipes.length === 0) {
        return;
      }
      // TODO: Finish up params
      // const contentInfo = this.metadataProvider.getContentDecoratorMetadata(
      //   instance,
      //   methodName,
      // );
      // if (!contentInfo) {
      //   return;
      // }
      // const argsTypeList = this.metadataProvider.getParamTypesMetadata(
      //   instance,
      //   methodName,
      // );
      // if (
      //   argsTypeList.length === 0 ||
      //   argsTypeList[contentInfo.parameterIndex] === String
      // ) {
      //   return;
      // }
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
    const { instance, methodName, event, context, content, type } = options;
    const pipesListForMethod = this.pipeList.find(
      (item: DiscordPipeList) =>
        item.methodName === methodName && item.instance === instance,
    );
    if (!pipesListForMethod) {
      return;
    }
    return pipesListForMethod.pipeList.reduce(
      async (prev: Promise<any>, curr: DiscordPipeTransform) => {
        const prevData = await prev;
        return curr.transform(event, context, prevData, type);
      },
      Promise.resolve(content),
    );
  }
}
