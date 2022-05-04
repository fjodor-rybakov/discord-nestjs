import { Injectable, Type } from '@nestjs/common';
import { DiscoveryService, ModuleRef } from '@nestjs/core';
import { Module } from '@nestjs/core/injector/module';

import { FilterType } from '../definitions/types/filter.type';
import { GuardType } from '../definitions/types/guard.type';
import { PipeType } from '../definitions/types/pipe.type';

@Injectable()
export class InstantiationService {
  constructor(private readonly discoveryService: DiscoveryService) {}

  getHostModule(baseClassInstance: InstanceType<any>): Module {
    const instanceWrapper = [
      ...this.discoveryService.getControllers(),
      ...this.discoveryService.getProviders(),
    ].find(({ token }) => token === baseClassInstance.constructor);

    if (!instanceWrapper?.host)
      throw new Error(
        `Not found module for ${baseClassInstance.constructor.name} class`,
      );

    return instanceWrapper.host;
  }

  exploreInstances(
    classTypeOrInstance: (PipeType | FilterType | GuardType | Type)[],
    hostModule: Module,
  ): Promise<InstanceType<any>[]> {
    return Promise.all(
      classTypeOrInstance.map((classTypeOrInstance) => {
        // User-created instance
        if (typeof classTypeOrInstance !== 'function')
          return classTypeOrInstance;

        hostModule.addProvider(classTypeOrInstance);

        // Create an instance in the host module
        return hostModule
          .getProviderByKey(ModuleRef)
          .instance.create(classTypeOrInstance);
      }),
    );
  }
}
