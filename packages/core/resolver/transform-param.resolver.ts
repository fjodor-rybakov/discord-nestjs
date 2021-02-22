import { Injectable } from '@nestjs/common';
import { defaultMetadataStorage } from 'class-transformer/cjs/storage';
import { TransformParamList } from './interface/transform-param-list';
import { ConstructorType } from '../util/type/constructor-type';
import { ReflectMetadataProvider } from '../provider/reflect-metadata.provider';
import { MethodResolveOptions } from './interface/method-resolve-options';
import { ParamResolver } from './param.resolver';

@Injectable()
export class TransformParamResolver {
  private readonly transformParamList: TransformParamList[] = [];

  constructor(
    private readonly metadataProvider: ReflectMetadataProvider,
    private readonly paramResolver: ParamResolver,
  ) {
  }

  resolve(options: MethodResolveOptions): void {
    const {instance, methodName} = options;
    const paramType = this.paramResolver.getContentType({
      instance,
      methodName,
    });
    if (!paramType) {
      return;
    }
    const properties = defaultMetadataStorage.getExposedProperties(paramType, 1);
    if (properties.length === 0) {
      return;
    }
    let last = 0;
    for (const propertyKey of properties) {
      const metadataArgNum = this.metadataProvider.getArgNumDecoratorMetadata(
        paramType.prototype,
        propertyKey,
      );
      const metadataArgRange = this.metadataProvider.getArgRangeDecoratorMetadata(
        paramType.prototype,
        propertyKey,
      );
      if (metadataArgNum) {
        const argNum = metadataArgNum(last);
        const metadataTransformToUser = this.metadataProvider.getTransformToUserDecoratorMetadata(
          paramType.prototype,
          propertyKey,
        );
        this.transformParamList.push({
          instance: paramType,
          propertyKey,
          last,
          argNum,
          transformToUser: metadataTransformToUser
        });
        last = argNum.position;
      }
      if (metadataArgRange) {
        const argRange = metadataArgRange(last);
        this.transformParamList.push({
          instance: paramType,
          propertyKey,
          last,
          argRange
        });
        last = argRange.toPosition;
      }
    }
  }

  getTransformParamByTarget(classType: ConstructorType): TransformParamList[] {
    return this.transformParamList.filter((item: TransformParamList) => item.instance === classType);
  }

  getTransformParamByTargetAndProperty(
    classType: ConstructorType,
    propertyKey: string
  ): TransformParamList {
    return this.transformParamList.find(
      (item: TransformParamList) => item.instance === classType && item.propertyKey === propertyKey
    );
  }
}