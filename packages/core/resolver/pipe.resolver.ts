import { Injectable } from '@nestjs/common';
import { ReflectMetadataProvider } from '../provider/reflect-metadata.provider';
import { ModuleRef } from '@nestjs/core';
import { MethodResolveOptions } from './interface/method-resolve-options';
import { DiscordPipeList } from './interface/discord-pipe-list';
import { DiscordPipeTransform } from '../decorator/interface/discord-pipe-transform';
import { DiscordPipeOptions } from './interface/discord-pipe-options';
import { MethodResolver } from './interface/method-resolver';
import { PipeType } from '../util/type/pipe-type';
import { DiscordService } from '../service/discord.service';
import { ConstructorType } from '../util/type/constructor-type';

@Injectable()
export class PipeResolver implements MethodResolver {
  private readonly pipeList: DiscordPipeList[] = [];

  constructor(
    private readonly metadataProvider: ReflectMetadataProvider,
    private readonly moduleRef: ModuleRef,
    private readonly discordService: DiscordService,
  ) {
  }

  async resolve(options: MethodResolveOptions): Promise<void> {
    const { instance, methodName } = options;
    let pipes = this.metadataProvider.getUsePipesDecoratorMetadata(
      instance,
      methodName,
    );
    if (!pipes) {
      const onCommandMetadata = this.metadataProvider.getOnCommandDecoratorMetadata(instance, methodName);
      const onMessageMetadata = this.metadataProvider.getOnMessageDecoratorMetadata(instance, methodName);
      const onceMessageMetadata = this.metadataProvider.getOnceMessageDecoratorMetadata(instance, methodName);
      if (!onCommandMetadata && !onMessageMetadata && !onceMessageMetadata) {
        return;
      }
      const pipesListForMethod = this.pipeList.find(
        (item: DiscordPipeList) => item.methodName === methodName && item.instance === instance,
      );
      if (pipesListForMethod) {
        return;
      }
      pipes = this.discordService.getPipes();
      if (pipes.length === 0) {
        return;
      }
      const contentInfo = this.metadataProvider.getContentDecoratorMetadata(instance, methodName);
      if (!contentInfo) {
        return;
      }
      const argsTypeList = this.metadataProvider.getParamTypesMetadata(instance, methodName);
      if (argsTypeList.length === 0 || argsTypeList[contentInfo.parameterIndex] === String) {
        return;
      }
    }
    await this.addPipe(options, pipes);
  }

  async addPipe(options: MethodResolveOptions, pipes: PipeType[]): Promise<void> {
    const { instance, methodName } = options;
    const pipeListForMethod: DiscordPipeTransform[] = [];
    for await(const pipe of pipes) {
      const classType = typeof pipe === 'function' ? pipe : pipe.constructor as ConstructorType;
      const newPipeInstance = await this.moduleRef.create(classType);
      if (typeof pipe !== 'function') { // resolve constructor params
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
      (item: DiscordPipeList) => item.methodName === methodName && item.instance === instance,
    );
    if (!pipesListForMethod) {
      return;
    }
    return pipesListForMethod.pipeList.reduce(
      async (
        prev: Promise<any>,
        curr: DiscordPipeTransform,
      ) => {
        const prevData = await prev;
        return curr.transform(event, context, prevData, type);
      },
      Promise.resolve(content),
    );
  }
}