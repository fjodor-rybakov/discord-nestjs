import { Injectable } from '@nestjs/common';
import { ClassResolver } from './interface/class-resolver';
import { ClassResolveOptions } from './interface/class-resolve-options';
import { GuardResolver } from './guard.resolver';
import { ReflectMetadataProvider } from '../provider/reflect-metadata.provider';
import { MetadataScanner } from '@nestjs/core';

@Injectable()
export class GuardClassResolver implements ClassResolver {
  constructor(
    private readonly guardResolver: GuardResolver,
    private readonly metadataProvide: ReflectMetadataProvider,
    private readonly metadataScanner: MetadataScanner,
  ) {
  }

  async resolve(options: ClassResolveOptions): Promise<void> {
    const {instance} = options;
    const metadata = this.metadataProvide.getUseGuardsDecoratorMetadata(instance);
    if (!metadata) {
      return;
    }
    const allClassMethods = this.metadataScanner.getAllFilteredMethodNames(Object.getPrototypeOf(instance));
    for await (const methodName of allClassMethods) {
      await this.guardResolver.addGuard({
        instance,
        methodName
      }, metadata);
    }
  }
}