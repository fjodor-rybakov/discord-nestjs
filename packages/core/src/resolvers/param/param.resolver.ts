import { Injectable, Type } from '@nestjs/common';

import { ReflectMetadataProvider } from '../../providers/reflect-metadata.provider';
import { MethodResolveOptions } from '../interfaces/method-resolve-options';
import { MethodResolver } from '../interfaces/method-resolver';
import { DecoratorParamInfo } from './decorator-param-info';
import { DecoratorParamType } from './decorator-param-type';
import { ParamOptions } from './param-options';

@Injectable()
export class ParamResolver implements MethodResolver {
  private readonly params: ParamOptions[] = [];

  constructor(private readonly metadataProvider: ReflectMetadataProvider) {}

  resolve({ instance, methodName }: MethodResolveOptions): void {
    const paramsTypes = this.metadataProvider.getParamTypesMetadata(
      instance,
      methodName,
    );
    if (!paramsTypes) return;

    this.processPayloadData({ instance, methodName }, paramsTypes);
  }

  private processPayloadData(
    { instance, methodName }: MethodResolveOptions,
    paramsTypes: Type[],
  ): void {
    const payloadMetadata = this.metadataProvider.getPayloadDecoratorMetadata(
      instance,
      methodName,
    );
    if (!payloadMetadata) return;

    const paramItem: ParamOptions = {
      instance,
      methodName,
      params: [],
    };

    const { parameterIndex } = payloadMetadata;
    paramItem.params[parameterIndex] = {
      decoratorType: DecoratorParamType.PAYLOAD,
      paramType: paramsTypes[parameterIndex],
    };

    this.params.push(paramItem);
  }

  getPayloadType(options: MethodResolveOptions): Type {
    const { instance, methodName } = options;
    const paramsList = this.params.find(
      (item: ParamOptions) =>
        item.instance === instance && item.methodName === methodName,
    );
    if (!paramsList) return;

    return paramsList.params.find(
      (item: DecoratorParamInfo) =>
        item.decoratorType === DecoratorParamType.PAYLOAD,
    )?.paramType;
  }
}
