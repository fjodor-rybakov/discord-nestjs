import { Injectable } from '@nestjs/common';

import { DiscordPipeTransform } from '../../decorators/pipe/discord-pipe-transform';
import { ReflectMetadataProvider } from '../../providers/reflect-metadata.provider';
import { DiscordOptionService } from '../../services/discord-option.service';
import { InstantiationService } from '../../services/instantiation.service';
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
    private readonly instantiationService: InstantiationService,
  ) {}

  async resolve(options: MethodResolveOptions): Promise<void> {
    const { instance, methodName } = options;

    const globalPipes = this.discordOptionService.getClientData().usePipes;

    const classPipes =
      this.metadataProvider.getUsePipesDecoratorMetadata(instance) ?? [];

    const methodPipes =
      this.metadataProvider.getUsePipesDecoratorMetadata(
        instance,
        methodName,
      ) ?? [];

    if (classPipes.length === 0 && methodPipes.length === 0) {
      if (globalPipes.length !== 0)
        this.pipeList.push({
          instance,
          methodName,
          pipeList: globalPipes,
        });

      return;
    }

    const localPipeInstances = await this.instantiationService.resolveInstances(
      [...classPipes, ...methodPipes],
      this.instantiationService.getHostModule(instance),
    );

    this.pipeList.push({
      instance,
      methodName,
      pipeList: [...globalPipes, ...localPipeInstances],
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
