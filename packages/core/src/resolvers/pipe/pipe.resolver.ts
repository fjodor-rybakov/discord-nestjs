import { Injectable } from '@nestjs/common';

import { DiscordPipeTransform } from '../../decorators/pipe/discord-pipe-transform';
import { ReflectMetadataProvider } from '../../providers/reflect-metadata.provider';
import { DiscordOptionService } from '../../services/discord-option.service';
import { InstantiationService } from '../../services/instantiation.service';
import { MethodResolveOptions } from '../interfaces/method-resolve-options';
import { MethodResolver } from '../interfaces/method-resolver';
import { DiscordPipeOptions } from './discord-pipe-options';
import { DiscordPipes } from './discord-pipes';

@Injectable()
export class PipeResolver implements MethodResolver {
  private readonly discordPipes = new Map<InstanceType<any>, DiscordPipes>();

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
        this.discordPipes.set(instance, {
          globalPipes,
          classPipes: [],
          methodPipes: {},
        });

      return;
    }

    const hostModule = this.instantiationService.getHostModule(instance);
    const methodPipeInstances =
      await this.instantiationService.resolveInstances(methodPipes, hostModule);

    if (this.discordPipes.has(instance))
      this.discordPipes.get(instance).methodPipes[methodName] =
        methodPipeInstances;
    else {
      const classPipeInstances =
        await this.instantiationService.resolveInstances(
          classPipes,
          hostModule,
        );

      this.discordPipes.set(instance, {
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
    if (!this.discordPipes.has(instance)) return;

    const { globalPipes, classPipes, methodPipes } =
      this.discordPipes.get(instance);

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
