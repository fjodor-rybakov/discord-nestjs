import {
  ArgNumOptions,
  ArgRangeOptions,
  DiscordArgumentMetadata,
  DiscordPipeTransform,
  ReflectMetadataProvider,
} from '@discord-nestjs/core';
import { Inject, Injectable, Optional } from '@nestjs/common';
import { ClassTransformOptions, plainToInstance } from 'class-transformer';
import { Message } from 'discord.js';

import { TRANSFORMER_OPTION } from '../contants/transformer-options.constant';

@Injectable()
export class PrefixCommandTransformPipe implements DiscordPipeTransform {
  constructor(
    private readonly metadataProvider: ReflectMetadataProvider,
    @Optional()
    @Inject(TRANSFORMER_OPTION)
    private readonly classTransformerOptions?: ClassTransformOptions,
  ) {}

  transform(
    message: Message,
    metadata: DiscordArgumentMetadata<'messageCreate'>,
  ): InstanceType<any> {
    if (!metadata.metatype || !message) return;

    const { dtoInstance } = metadata.commandNode;
    const plainObject = {};

    const messageContentParts = message.content.split(' ');
    let lastIndex = 0;

    Object.keys(dtoInstance).forEach((property: string) => {
      const argNumMetadata = this.metadataProvider.getArgNumDecoratorMetadata(
        dtoInstance,
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
          dtoInstance,
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

    console.log(plainObject);

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
