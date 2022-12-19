import {
  DiscordArgumentMetadata,
  DiscordPipeTransform,
  ReflectMetadataProvider,
} from '@discord-nestjs/core';
import { Inject, Injectable, Optional } from '@nestjs/common';
import { ClassTransformOptions, plainToInstance } from 'class-transformer';
import { ModalSubmitInteraction } from 'discord.js';

import { TRANSFORMER_OPTION } from '../contants/transformer-options.constant';

@Injectable()
export class ModalFieldsTransformPipe implements DiscordPipeTransform {
  constructor(
    private readonly metadataProvider: ReflectMetadataProvider,
    @Optional()
    @Inject(TRANSFORMER_OPTION)
    private readonly classTransformerOptions?: ClassTransformOptions,
  ) {}

  transform(
    [modal]: [ModalSubmitInteraction],
    metadata: DiscordArgumentMetadata<'interactionCreate'>,
  ): any {
    if (!metadata.metatype || !modal) return;

    const { dtoInstance } = metadata.commandNode;
    const plainObject = {};

    Object.keys(dtoInstance).forEach((property) => {
      const fieldCustomMetadata =
        this.metadataProvider.getFiledDecoratorMetadata(dtoInstance, property);
      if (fieldCustomMetadata && modal.fields) {
        plainObject[property] = modal.fields.getField(
          fieldCustomMetadata.customId ?? property,
          fieldCustomMetadata.type,
        );

        return;
      }

      const textInputValueCustomMetadata =
        this.metadataProvider.getTextInputValueDecoratorMetadata(
          dtoInstance,
          property,
        );
      if (textInputValueCustomMetadata && modal.fields) {
        plainObject[property] = modal.fields.getTextInputValue(
          textInputValueCustomMetadata.customId ?? property,
        );

        return;
      }
    });

    return plainToInstance(
      metadata.metatype,
      plainObject,
      this.classTransformerOptions,
    );
  }
}
