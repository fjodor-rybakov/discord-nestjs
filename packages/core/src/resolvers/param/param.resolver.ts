import { Injectable, Type } from '@nestjs/common';

import { ReflectMetadataProvider } from '../../providers/reflect-metadata.provider';

@Injectable()
export class ParamResolver {
  constructor(private readonly metadataProvider: ReflectMetadataProvider) {}

  getPayloadType(instance: InstanceType<any>, methodName: string): Type {
    const paramsTypes = this.metadataProvider.getParamTypesMetadata(
      instance,
      methodName,
    );
    if (!paramsTypes) return;

    const payloadMetadata = this.metadataProvider.getPayloadDecoratorMetadata(
      instance,
      methodName,
    );
    if (!payloadMetadata) return;

    return paramsTypes[payloadMetadata.parameterIndex];
  }
}
