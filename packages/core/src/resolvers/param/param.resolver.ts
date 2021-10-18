import { ReflectMetadataProvider } from '../../providers/reflect-metadata.provider';
import { MethodResolveOptions } from '../interfaces/method-resolve-options';
import { MethodResolver } from '../interfaces/method-resolver';
import { DecoratorParamType } from './decorator-param-type';
import { DecoratorTypeArg } from './decorator-type-arg';
import { ParamOptions } from './param-options';
import { Injectable, Type } from '@nestjs/common';

@Injectable()
export class ParamResolver implements MethodResolver {
  private readonly params: ParamOptions[] = []; // TODO: Maybe remove

  constructor(private readonly metadataProvider: ReflectMetadataProvider) {}

  resolve({
    instance,
    methodName,
  }: MethodResolveOptions): Promise<void> | void {
    const paramsTypes = this.metadataProvider.getParamTypesMetadata(
      instance,
      methodName,
    );
    if (!paramsTypes) {
      return;
    }

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
    if (!payloadMetadata) {
      return;
    }

    const paramItem: ParamOptions = {
      instance,
      methodName,
      args: [],
    };

    const { parameterIndex } = payloadMetadata;
    paramItem.args[parameterIndex] = {
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
    if (!paramsList) {
      return;
    }
    return paramsList.args.find(
      (item: DecoratorTypeArg) =>
        item.decoratorType === DecoratorParamType.PAYLOAD,
    )?.paramType;
  }
}
