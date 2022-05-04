import { Injectable, Type } from '@nestjs/common';

import { DiscordPipeTransform } from '../../decorators/pipe/discord-pipe-transform';
import { ReflectMetadataProvider } from '../../providers/reflect-metadata.provider';
import { DiscordOptionService } from '../../services/discord-option.service';
import { InstantiationService } from '../../services/instantiation.service';
import { MethodExplorer } from '../interfaces/method-explorer';
import { MethodExplorerOptions } from '../interfaces/method-explorer-options';
import { DiscordPipeOptions } from './discord-pipe-options';
import { DiscordPipes } from './discord-pipes';

@Injectable()
export class PipeExplorer implements MethodExplorer {
  private readonly cachedPipes = new WeakMap<Type, DiscordPipes>();

  constructor(
    private readonly metadataProvider: ReflectMetadataProvider,
    private readonly discordOptionService: DiscordOptionService,
    private readonly instantiationService: InstantiationService,
  ) {}

  async explore(options: MethodExplorerOptions): Promise<void> {
    const { instance, methodName } = options;

    const globalPipes = this.discordOptionService.getClientData().usePipes;

    const classPipes =
      this.metadataProvider.getUsePipesDecoratorMetadata(instance) ?? [];

    const methodPipes =
      this.metadataProvider.getUsePipesDecoratorMetadata(
        instance,
        methodName,
      ) ?? [];

    const classType = instance.constructor;

    if (classPipes.length === 0 && methodPipes.length === 0) {
      if (globalPipes.length !== 0)
        this.cachedPipes.set(classType, {
          globalPipes,
          classPipes: [],
          methodPipes: {},
        });

      return;
    }

    const hostModule = this.instantiationService.getHostModule(instance);
    const methodPipeInstances =
      await this.instantiationService.exploreInstances(methodPipes, hostModule);

    if (this.cachedPipes.has(classType))
      this.cachedPipes.get(classType).methodPipes[methodName] =
        methodPipeInstances;
    else {
      const classPipeInstances =
        await this.instantiationService.exploreInstances(
          classPipes,
          hostModule,
        );

      this.cachedPipes.set(classType, {
        methodPipes: { [methodName]: methodPipeInstances },
        classPipes: classPipeInstances,
        globalPipes,
      });
    }
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
    const classType = instance.constructor;

    if (!this.cachedPipes.has(classType)) return;

    const { globalPipes, classPipes, methodPipes } =
      this.cachedPipes.get(classType);

    return [
      ...globalPipes,
      ...classPipes,
      ...(methodPipes[methodName] || []),
    ].reduce(async (prev: Promise<any>, curr: DiscordPipeTransform) => {
      const prevData = await prev;
      return curr.transform(prevData, {
        event,
        eventArgs,
        metatype,
        commandNode,
      });
    }, Promise.resolve(initValue));
  }
}
