import { Injectable } from '@nestjs/common';
import { MetadataScanner } from '@nestjs/core';

import { ReflectMetadataProvider } from '../../providers/reflect-metadata.provider';
import { ClassResolveOptions } from '../interfaces/class-resolve-options';
import { ClassResolver } from '../interfaces/class-resolver';
import { GuardResolver } from './guard.resolver';

@Injectable()
export class GuardClassResolver implements ClassResolver {
  constructor(
    private readonly guardResolver: GuardResolver,
    private readonly metadataProvide: ReflectMetadataProvider,
    private readonly metadataScanner: MetadataScanner,
  ) {}

  async resolve(options: ClassResolveOptions): Promise<void> {
    const { instance } = options;
    const metadata =
      this.metadataProvide.getUseGuardsDecoratorMetadata(instance);
    if (!metadata) return;

    const allClassMethods = this.metadataScanner.getAllFilteredMethodNames(
      Object.getPrototypeOf(instance),
    );
    for await (const methodName of allClassMethods) {
      await this.guardResolver.addGuard(
        {
          instance,
          methodName,
        },
        metadata,
      );
    }
  }
}
