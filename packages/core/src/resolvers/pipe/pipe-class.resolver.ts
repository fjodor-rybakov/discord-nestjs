import { Injectable } from '@nestjs/common';
import { MetadataScanner } from '@nestjs/core';
import { ClassResolver } from '../interfaces/class-resolver';
import { PipeResolver } from './pipe.resolver';
import { ReflectMetadataProvider } from '../../providers/reflect-metadata.provider';
import { ClassResolveOptions } from '../interfaces/class-resolve-options';

@Injectable()
export class PipeClassResolver implements ClassResolver {
  constructor(
    private readonly pipeResolver: PipeResolver,
    private readonly metadataProvide: ReflectMetadataProvider,
    private readonly metadataScanner: MetadataScanner,
  ) {}

  async resolve(options: ClassResolveOptions): Promise<void> {
    const { instance } = options;
    const metadata =
      this.metadataProvide.getUsePipesDecoratorMetadata(instance);
    if (!metadata) {
      return;
    }
    const allClassMethods = this.metadataScanner.getAllFilteredMethodNames(
      Object.getPrototypeOf(instance),
    );
    for await (const methodName of allClassMethods) {
      await this.pipeResolver.addPipe(
        {
          instance,
          methodName,
        },
        metadata,
      );
    }
  }
}
