import { Injectable } from '@nestjs/common';
import { defaultMetadataStorage } from 'class-transformer/cjs/storage';
import { ArgParamList } from './interface/arg-param-list';
import { ConstructorType } from '../util/type/constructor-type';
import { ReflectMetadataProvider } from '../provider/reflect-metadata.provider';
import { MethodResolveOptions } from './interface/method-resolve-options';
import { ParamResolver } from './param.resolver';

@Injectable()
export class ArgParamResolver {
  private readonly argParamList: ArgParamList[] = [];

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
        this.argParamList.push({
          instance: paramType,
          propertyKey,
          last,
          argNum
        });
        last = argNum.position;
      }
      if (metadataArgRange) {
        const argRange = metadataArgRange(last);
        this.argParamList.push({
          instance: paramType,
          propertyKey,
          last,
          argRange
        });
        last = argRange.toPosition;
      }
    }
  }

  getArgsParamByTarget(classType: ConstructorType): ArgParamList[] {
    return this.argParamList.filter((item: ArgParamList) => item.instance === classType);
  }

  getArgsParamByTargetAndProperty(
    classType: ConstructorType,
    propertyKey: string
  ): ArgParamList {
    return this.argParamList.find(
      (item: ArgParamList) => item.instance === classType && item.propertyKey === propertyKey
    );
  }
}