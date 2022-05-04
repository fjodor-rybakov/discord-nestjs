import { Injectable, Type } from '@nestjs/common';

import { ReflectMetadataProvider } from '../../providers/reflect-metadata.provider';
import { DiscordOptionService } from '../../services/discord-option.service';
import { InstantiationService } from '../../services/instantiation.service';
import { MethodExplorer } from '../interfaces/method-explorer';
import { MethodExplorerOptions } from '../interfaces/method-explorer-options';
import { DiscordFilterOptions } from './discord-filter-options';
import { DiscordFilters } from './discord-filters';

@Injectable()
export class FilterExplorer implements MethodExplorer {
  private readonly cachedFilters = new WeakMap<Type, DiscordFilters>();

  constructor(
    private readonly metadataProvider: ReflectMetadataProvider,
    private readonly discordOptionService: DiscordOptionService,
    private readonly instantiationService: InstantiationService,
  ) {}

  async explore(options: MethodExplorerOptions): Promise<void> {
    const { instance, methodName } = options;

    const globalFilters = this.discordOptionService
      .getClientData()
      .useFilters.reverse(); // Like in NestJS

    const classFilters = (
      this.metadataProvider.getUseFiltersDecoratorMetadata(instance) ?? []
    ).reverse(); // Like in NestJS

    const methodFilters = (
      this.metadataProvider.getUseFiltersDecoratorMetadata(
        instance,
        methodName,
      ) ?? []
    ).reverse(); // Like in NestJS

    const classType = instance.constructor;

    if (classFilters.length === 0 && methodFilters.length === 0) {
      if (globalFilters.length !== 0)
        this.cachedFilters.set(classType, {
          globalFilters,
          classFilters: [],
          methodFilters: {},
        });

      return;
    }

    const hostModule = this.instantiationService.getHostModule(instance);
    const methodFilterInstances =
      await this.instantiationService.exploreInstances(
        methodFilters,
        hostModule,
      );

    if (this.cachedFilters.has(classType))
      this.cachedFilters.get(classType).methodFilters[methodName] =
        methodFilterInstances;
    else {
      const classFilterInstances =
        await this.instantiationService.exploreInstances(
          classFilters,
          hostModule,
        );

      this.cachedFilters.set(classType, {
        methodFilters: { [methodName]: methodFilterInstances },
        classFilters: classFilterInstances,
        globalFilters,
      });
    }
  }

  async applyFilter(options: DiscordFilterOptions): Promise<boolean> {
    const {
      instance,
      methodName,
      event,
      eventArgs,
      exception,
      metatype,
      commandNode,
    } = options;
    const classType = instance.constructor;

    if (!this.cachedFilters.has(classType)) return true;

    const { globalFilters, classFilters, methodFilters } =
      this.cachedFilters.get(classType);
    const exceptionFilters = [
      ...globalFilters,
      ...classFilters,
      ...(methodFilters[methodName] || []),
    ];
    let indexOfAnyException: number;
    const matchedFilters = exceptionFilters.filter((filter, index) => {
      const catchExceptionTypes =
        this.metadataProvider.getCatchDecoratorMetadata(filter);

      const isAnyException = catchExceptionTypes.length === 0;
      if (isAnyException && !indexOfAnyException) indexOfAnyException = index;

      const hasConcreteType = catchExceptionTypes.some((expectException) => {
        const exceptionType = this.getExceptionConstructor(exception);

        return this.getAllParents(exceptionType)
          .concat([exceptionType])
          .includes(expectException);
      });

      return hasConcreteType || isAnyException;
    });

    const [concreteMatchedFilter] = matchedFilters;
    if (concreteMatchedFilter)
      await concreteMatchedFilter.catch(exception, {
        event,
        eventArgs,
        metatype,
        commandNode,
      });
    else if (indexOfAnyException)
      await matchedFilters[indexOfAnyException].catch(exception, {
        event,
        eventArgs,
        metatype,
        commandNode,
      });

    return !(concreteMatchedFilter || indexOfAnyException);
  }

  private getExceptionConstructor(exception: any): Type {
    return Array.isArray(exception)
      ? exception[0].constructor
      : exception.constructor;
  }

  private getAllParents(error: any): Type[] {
    const classes = [];
    while ((error = Object.getPrototypeOf(error)))
      !Object.getOwnPropertyNames(error).includes('constructor') &&
        error.name !== 'Error' &&
        classes.push(error);

    return classes;
  }
}
