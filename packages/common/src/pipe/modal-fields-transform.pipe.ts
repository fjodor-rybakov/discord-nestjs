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
      const fieldCustomId = this.metadataProvider.getFiledDecoratorMetadata(
        dtoInstance,
        property,
      );
      if (fieldCustomId) {
        plainObject[property] = modal.fields.getField(fieldCustomId);

        return;
      }

      const textInputValueCustomId =
        this.metadataProvider.getTextInputValueDecoratorMetadata(
          dtoInstance,
          property,
        );
      if (textInputValueCustomId) {
        plainObject[property] = modal.fields.getTextInputValue(
          textInputValueCustomId,
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
