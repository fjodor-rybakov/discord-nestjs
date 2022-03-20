import { Injectable, Type } from '@nestjs/common';

import { ReflectMetadataProvider } from '../../providers/reflect-metadata.provider';
import { DiscordOptionService } from '../../services/discord-option.service';
import { InstantiationService } from '../../services/instantiation.service';
import { MethodResolveOptions } from '../interfaces/method-resolve-options';
import { MethodResolver } from '../interfaces/method-resolver';
import { DiscordFilterOptions } from './discord-filter-options';
import { DiscordFilters } from './discord-filters';

@Injectable()
export class FilterResolver implements MethodResolver {
  private readonly discordFilters = new Map<
    InstanceType<any>,
    DiscordFilters
  >();

  constructor(
    private readonly metadataProvider: ReflectMetadataProvider,
    private readonly discordOptionService: DiscordOptionService,
    private readonly instantiationService: InstantiationService,
  ) {}

  async resolve(options: MethodResolveOptions): Promise<void> {
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

    if (classFilters.length === 0 && methodFilters.length === 0) {
      if (globalFilters.length !== 0)
        this.discordFilters.set(instance, { globalFilters });

      return;
    }

    const hostModule = this.instantiationService.getHostModule(instance);
    const methodFilterInstances =
      await this.instantiationService.resolveInstances(
        methodFilters,
        hostModule,
      );

    if (this.discordFilters.has(instance))
      this.discordFilters.get(instance).methodFilters[methodName] =
        methodFilterInstances;
    else {
      const classFilterInstances =
        await this.instantiationService.resolveInstances(
          classFilters,
          hostModule,
        );

      this.discordFilters.set(instance, {
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
    if (!this.discordFilters.has(instance)) return true;

    const { globalFilters, classFilters, methodFilters } =
      this.discordFilters.get(instance);
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
