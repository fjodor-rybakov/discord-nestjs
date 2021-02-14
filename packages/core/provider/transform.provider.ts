import { Injectable } from '@nestjs/common';
import { defaultMetadataStorage } from 'class-transformer/types/storage';
import { plainToClass } from 'class-transformer';
import { MetadataProvider } from './interface/metadata.provider.interface';

@Injectable()
export class TransformProvider {
  constructor(
    private readonly metadataProvider: MetadataProvider,
  ) {
  }

  transformContent(classType: any, inputData: string): any {
    const inputPart = inputData.split(' ');
    const properties = defaultMetadataStorage.getExposedProperties(classType, 0);
    const newObj = {};
    for (const propKey of properties) {
      const metadata = this.metadataProvider.getArgNumDecoratorMetadata(
        classType.prototype,
        propKey,
      );
      if (metadata) {
        newObj[propKey] = inputPart[metadata.position];
      }
    }
    return plainToClass(classType, newObj);
  }
}