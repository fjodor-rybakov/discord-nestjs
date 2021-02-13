import { Injectable } from '@nestjs/common';
import { ReflectMetadataProvider } from '../provider/reflect-metadata.provider';
import { PropertyResolveOptions } from './interface/property-resolve-options';

@Injectable()
export class ParamResolver {
  private readonly params = [];

  constructor(
    private readonly metadataProvider: ReflectMetadataProvider,
  ) {}

  resolve(options: PropertyResolveOptions) {
    const {instance, methodName} = options;
    const contentMetadata = this.metadataProvider.getContentDecoratorMetadata(
      instance,
      methodName,
    );
    const contextMetadata = this.metadataProvider.getContextDecoratorMetadata(
      instance,
      methodName,
    );
  }

  private resolveContent(options: PropertyResolveOptions) {
    const {instance, methodName} = options;
    const contentMetadata = this.metadataProvider.getContentDecoratorMetadata(
      instance,
      methodName,
    );
    if (!contentMetadata) {
      return;
    }
    const paramsTypes = this.metadataProvider.getParamTypesMetadata(
      instance,
      methodName,
    );
    if (paramsTypes) {
      return;
    }

  }
}