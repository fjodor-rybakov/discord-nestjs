import { Injectable } from '@nestjs/common';
import { ClassTransformOptions, plainToClass } from 'class-transformer';
import { ReflectMetadataProvider } from './reflect-metadata.provider';
import { ConstructorType } from '../util/type/constructor-type';
import { ArgRangeOptions } from '../decorator/interface/arg-range-options';
import { ArgParamResolver } from '../resolver/arg-param.resolver';

@Injectable()
export class TransformProvider {
  constructor(
    private readonly metadataProvider: ReflectMetadataProvider,
    private readonly argParamResolver: ArgParamResolver,
  ) {
  }

  transformContent<T>(classType: ConstructorType<T>, inputData: string, options?: ClassTransformOptions): T {
    if (!classType || !inputData) {
      return;
    }
    const newObj = {};
    const inputPart = inputData.split(' ');
    const paramData = this.argParamResolver.getArgsParamByTarget(classType);
    for (const item of paramData) {
      if (item.argNum) {
        newObj[item.propertyKey] = inputPart[item.argNum.position];
      }
      if (item.argRange) {
        item.argRange.toPosition = item.argRange.toPosition !== undefined ? item.argRange.toPosition : inputPart.length;
        newObj[item.propertyKey] = inputPart.slice(item.argRange.formPosition, item.argRange.toPosition);
      }
    }
    return plainToClass(classType, newObj, options);
  }

  getArgPositions(target: any, propertyKey: string): ArgRangeOptions {
    const argData = this.argParamResolver.getArgsParamByTargetAndProperty(target.constructor, propertyKey);
    if (argData) {
      if (argData.argNum) {
        return {formPosition: argData.argNum.position};
      }
      if (argData.argRange) {
        return {
          formPosition: argData.argRange.formPosition,
          toPosition: argData.argRange.toPosition
        };
      }
    }
  }
}