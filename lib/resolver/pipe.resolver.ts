import { Injectable } from '@nestjs/common';
import { ReflectMetadataProvider } from '../provider/reflect-metadata.provider';
import { ModuleRef } from '@nestjs/core';
import { MethodResolveOptions } from './interface/method-resolve-options';
import { DiscordPipeList } from './interface/discord-pipe-list';
import { DiscordPipeTransform } from '../decorator/interface/discord-pipe-transform';
import { DiscordPipeOptions } from './interface/discord-pipe-options';

@Injectable()
export class PipeResolver {
  private readonly pipeList: DiscordPipeList[] = [];

  constructor(
    private readonly metadataProvider: ReflectMetadataProvider,
    private readonly moduleRef: ModuleRef,
  ) {
  }

  async resolve(options: MethodResolveOptions): Promise<void> {
    const { instance, methodName } = options;
    const pipes = this.metadataProvider.getUsePipesDecoratorMetadata(
      instance,
      methodName,
    );
    if (!pipes) {
      return;
    }
    const pipeListForMethod: DiscordPipeTransform[] = [];
    for await(const pipe of pipes) {
      if (typeof pipe === 'function') {
        const newPipeInstance = await this.moduleRef.create<DiscordPipeTransform>(pipe);
        pipeListForMethod.push(newPipeInstance);
      } else {
        pipeListForMethod.push(pipe);
      }
    }
    this.pipeList.push({
      instance,
      methodName,
      pipeList: pipeListForMethod,
    });
  }

  async applyPipe(options: DiscordPipeOptions): Promise<any> {
    const { instance, methodName, event, context, content } = options;
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
        return curr.transform(event, context, prevData);
      },
      Promise.resolve(content),
    );
  }
}