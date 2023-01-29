import {
  ArgNumOptions,
  ArgRangeOptions,
  ReflectMetadataProvider,
} from '@discord-nestjs/core';
import {
  ArgumentMetadata,
  Inject,
  Injectable,
  Optional,
  PipeTransform,
} from '@nestjs/common';
import { ClassTransformOptions, plainToInstance } from 'class-transformer';
import { Message } from 'discord.js';

import { TRANSFORMER_OPTION } from '../../contants/transformer-options.constant';

@Injectable()
export class PrefixCommandPipe implements PipeTransform {
  constructor(
    private readonly metadataProvider: ReflectMetadataProvider,
    @Optional()
    @Inject(TRANSFORMER_OPTION)
    private readonly classTransformerOptions?: ClassTransformOptions,
  ) {}

  transform(message: Message, metadata: ArgumentMetadata): InstanceType<any> {
    if (!metadata.metatype || !message || !(message instanceof Message)) return;

    const plainObject = {};
    const messageContentParts = message.content.split(' ');
    const allKeys = Object.keys(new metadata.metatype());

    let lastIndex = 0;

    allKeys.forEach((property: string) => {
      const argNumMetadata = this.metadataProvider.getArgNumDecoratorMetadata(
        metadata.metatype,
        property,
      );

      if (argNumMetadata) {
        const argPositions = argNumMetadata(lastIndex);

        plainObject[property] = this.getArgNumValue(
          messageContentParts,
          argPositions,
        );

        lastIndex = argPositions.position;

        return;
      }

      const argRangeMetadata =
        this.metadataProvider.getArgRangeDecoratorMetadata(
          metadata.metatype,
          property,
        );

      if (argRangeMetadata) {
        const argPositions = argRangeMetadata(lastIndex);

        plainObject[property] = this.getArgRangeValue(
          messageContentParts,
          argRangeMetadata(lastIndex),
        );

        lastIndex = argPositions.toPosition
          ? argPositions.toPosition
          : messageContentParts.length - 1;

        return;
      }
    });

    return plainToInstance(
      metadata.metatype,
      plainObject,
      this.classTransformerOptions,
    );
  }

  protected getArgNumValue(inputPart: string[], item: ArgNumOptions): string {
    return inputPart[item.position];
  }

  protected getArgRangeValue(
    inputPart: string[],
    item: ArgRangeOptions,
  ): string[] {
    item.toPosition =
      item.toPosition !== undefined ? item.toPosition : inputPart.length;
    return inputPart.slice(item.formPosition, item.toPosition);
  }
}
