import { Injectable, Type } from '@nestjs/common';

import { ReflectMetadataProvider } from '../../providers/reflect-metadata.provider';
import { DiscordOptionService } from '../../services/discord-option.service';
import { InstantiationService } from '../../services/instantiation.service';
import { MethodResolveOptions } from '../interfaces/method-resolve-options';
import { MethodResolver } from '../interfaces/method-resolver';
import { DiscordFilterOptions } from './discord-filter-options';
import { ResolvedFilterInfo } from './resolved-filter-info';

@Injectable()
export class FilterResolver implements MethodResolver {
  private readonly filterInfos: ResolvedFilterInfo[] = [];

  constructor(
    private readonly metadataProvider: ReflectMetadataProvider,
    private readonly discordOptionService: DiscordOptionService,
    private readonly instantiationService: InstantiationService,
  ) {}

  async resolve(options: MethodResolveOptions): Promise<void> {
    const { instance, methodName } = options;

    const globalFilters = this.discordOptionService.getClientData().useFilters;

    const classFilters =
      this.metadataProvider.getUseFiltersDecoratorMetadata(instance) ?? [];

    const methodFilters =
      this.metadataProvider.getUseFiltersDecoratorMetadata(
        instance,
        methodName,
      ) ?? [];

    if (classFilters.length === 0 && methodFilters.length === 0) {
      if (globalFilters.length !== 0)
        this.filterInfos.push({
          instance,
          methodName,
          exceptionFilters: globalFilters,
        });

      return;
    }

    const localFilterInstances =
      await this.instantiationService.resolveInstances(
        [...classFilters, ...methodFilters],
        this.instantiationService.getHostModule(instance),
      );

    this.filterInfos.push({
      instance,
      methodName,
      exceptionFilters: [...globalFilters, ...localFilterInstances].reverse(), // Like in NestJS
    });
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
    const filterListForMethod = this.getFilterData({ instance, methodName });
    if (!filterListForMethod) return true;

    let indexOfAnyException: number;
    const matchedFilters = filterListForMethod.exceptionFilters.filter(
      (filter, index) => {
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
      },
    );

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

  private getFilterData({
    instance,
    methodName,
  }: MethodResolveOptions): ResolvedFilterInfo {
    return this.filterInfos.find(
      (item: ResolvedFilterInfo) =>
        item.methodName === methodName && item.instance === instance,
    );
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
