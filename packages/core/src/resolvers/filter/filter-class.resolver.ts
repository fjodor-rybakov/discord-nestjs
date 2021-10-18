import { ReflectMetadataProvider } from '../../providers/reflect-metadata.provider';
import { ClassResolveOptions } from '../interfaces/class-resolve-options';
import { ClassResolver } from '../interfaces/class-resolver';
import { FilterResolver } from './filter.resolver';
import { Injectable } from '@nestjs/common';
import { MetadataScanner } from '@nestjs/core';

@Injectable()
export class FilterClassResolver implements ClassResolver {
  constructor(
    private readonly filterResolver: FilterResolver,
    private readonly metadataProvider: ReflectMetadataProvider,
    private readonly metadataScanner: MetadataScanner,
  ) {}

  async resolve(options: ClassResolveOptions): Promise<void> {
    const { instance } = options;
    const metadata =
      this.metadataProvider.getUseFiltersDecoratorMetadata(instance);
    if (!metadata) return;

    const someClassHasMetadata = [
      this.metadataProvider.getCommandDecoratorMetadata,
      this.metadataProvider.getSubCommandDecoratorMetadata,
    ].some((item) => item(instance));

    const allClassMethods = someClassHasMetadata
      ? ['handler']
      : this.metadataScanner.getAllFilteredMethodNames(
          Object.getPrototypeOf(instance),
        );
    for await (const methodName of allClassMethods) {
      await this.filterResolver.addFilter(
        {
          instance,
          methodName,
        },
        metadata,
      );
    }
  }
}
