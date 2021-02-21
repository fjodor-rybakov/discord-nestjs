import { Injectable } from '@nestjs/common';
import { defaultMetadataStorage } from 'class-transformer/cjs/storage';
import { ClassTransformOptions, plainToClass } from 'class-transformer';
import { ReflectMetadataProvider } from './reflect-metadata.provider';
import { ConstructorType } from '../util/type/constructor-type';
import { ArgRangeOptions } from '../decorator/interface/arg-range-options';

@Injectable()
export class TransformProvider {
  constructor(
    private readonly metadataProvider: ReflectMetadataProvider,
  ) {
  }

  transformContent<T>(classType: ConstructorType<T>, inputData: string, options?: ClassTransformOptions): T {
    if (!classType || !inputData) {
      return;
    }
    const inputPart = inputData.split(' ');
    const properties = defaultMetadataStorage.getExposedProperties(classType, 0);
    const newObj = {};
    let last = 0;
    for (const propKey of properties) {
      const metadataArgNum = this.metadataProvider.getArgNumDecoratorMetadata(
        classType.prototype,
        propKey,
      );
      const metadataArgRange = this.metadataProvider.getArgRangeDecoratorMetadata(
        classType.prototype,
        propKey,
      );
      if (metadataArgNum) {
        const argNum = metadataArgNum(last);
        newObj[propKey] = inputPart[argNum.position];
        last = argNum.position;
      }
      if (metadataArgRange) {
        const argRange = metadataArgRange(last);
        argRange.toPosition = argRange.toPosition !== undefined ? argRange.toPosition : inputPart.length;
        newObj[propKey] = inputPart.slice(argRange.formPosition, argRange.toPosition);
        last = argRange.toPosition;
      }
    }
    return plainToClass(classType, newObj, options);
  }

  getArgPositions(target: any, propertyKey: string, messagePartLength: number): ArgRangeOptions {
    const metadataArgNum = this.metadataProvider.getArgNumDecoratorMetadata(
      target,
      propertyKey,
    );
    if (metadataArgNum) {
      return {formPosition: metadataArgNum().position};
    }
    const metadataArgRange = this.metadataProvider.getArgRangeDecoratorMetadata(
      target,
      propertyKey,
    );
    if (metadataArgRange) {
      const pos = metadataArgRange();
      return {
        formPosition: pos.formPosition,
        toPosition: pos.toPosition ?? messagePartLength
      };
    }
  }
}