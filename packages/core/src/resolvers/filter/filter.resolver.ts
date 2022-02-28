import { Injectable, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import { DiscordExceptionFilter } from '../../decorators/filter/discord-exception-filter';
import { FilterType } from '../../definitions/types/filter.type';
import { ReflectMetadataProvider } from '../../providers/reflect-metadata.provider';
import { DiscordOptionService } from '../../services/discord-option.service';
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
    private readonly moduleRef: ModuleRef,
  ) {}

  async resolve(options: MethodResolveOptions): Promise<void> {
    const { instance, methodName } = options;
    let filters = this.metadataProvider.getUseFiltersDecoratorMetadata(
      instance,
      methodName,
    );
    if (!filters) {
      const hasMetadataForPipe = this.checkApplyGlobalPipe(options);
      if (!hasMetadataForPipe) return;

      const filterAlreadyRegistered = this.getFilterData(options);
      if (filterAlreadyRegistered) return;

      filters = this.discordOptionService.getClientData().useFilters;
      if (filters.length === 0) return;
    }
    await this.addFilter(options, filters);
  }

  async addFilter(
    options: MethodResolveOptions,
    filters: FilterType[],
  ): Promise<void> {
    const { instance, methodName } = options;
    const exceptionFilters: DiscordExceptionFilter[] = [];
    for await (const filter of filters) {
      const classType =
        typeof filter === 'function' ? filter : (filter.constructor as Type);
      const newFilterInstance = await this.moduleRef.create(classType);
      exceptionFilters.push(newFilterInstance);
    }
    this.filterInfos.push({
      instance,
      methodName,
      exceptionFilters,
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
