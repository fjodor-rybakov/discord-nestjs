import { Injectable } from '@nestjs/common';
import { ClassResolver } from './interface/class-resolver';
import { ClassResolveOptions } from './interface/class-resolve-options';
import { ReflectMetadataProvider } from '../provider/reflect-metadata.provider';
import { MetadataScanner } from '@nestjs/core';
import { PipeResolver } from './pipe.resolver';

@Injectable()
export class PipeClassResolver implements ClassResolver {
  constructor(
    private readonly pipeResolver: PipeResolver,
    private readonly metadataProvide: ReflectMetadataProvider,
    private readonly metadataScanner: MetadataScanner,
  ) {
  }

  async resolve(options: ClassResolveOptions): Promise<void> {
    const {instance} = options;
    const metadata = this.metadataProvide.getUsePipesDecoratorMetadata(instance);
    if (!metadata) {
      return;
    }
    const allClassMethods = this.metadataScanner.getAllFilteredMethodNames(Object.getPrototypeOf(instance));
    for await (const methodName of allClassMethods) {
      await this.pipeResolver.addPipe({
        instance,
        methodName
      }, metadata);
    }
  }
}