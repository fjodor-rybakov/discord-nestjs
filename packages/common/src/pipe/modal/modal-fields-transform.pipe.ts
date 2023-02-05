import { ReflectMetadataProvider } from '@discord-nestjs/core';
import {
  ArgumentMetadata,
  Inject,
  Injectable,
  Optional,
  PipeTransform,
  Type,
} from '@nestjs/common';
import { ClassTransformOptions, plainToInstance } from 'class-transformer';
import { Interaction } from 'discord.js';

import { TRANSFORMER_OPTION } from '../../contants/transformer-options.constant';

@Injectable()
export class ModalFieldsTransformPipe implements PipeTransform {
  constructor(
    private readonly metadataProvider: ReflectMetadataProvider,
    @Optional()
    @Inject(TRANSFORMER_OPTION)
    private readonly classTransformerOptions?: ClassTransformOptions,
  ) {}

  transform(
    interaction: Interaction,
    metadata: ArgumentMetadata,
  ): InstanceType<any> {
    const { metatype } = metadata;
    if (
      !metatype ||
      !this.isDto(metatype) ||
      !interaction ||
      typeof interaction['isModalSubmit'] !== 'function' ||
      !interaction.isModalSubmit()
    )
      return;

    const dtoInstance = new metatype();
    const keys = Object.keys(dtoInstance);
    const plainObject = {};

    keys.forEach((property) => {
      const fieldCustomMetadata =
        this.metadataProvider.getFiledDecoratorMetadata(metatype, property);
      if (fieldCustomMetadata && interaction.fields) {
        plainObject[property] = interaction.fields.getField(
          fieldCustomMetadata.customId ?? property,
          fieldCustomMetadata.type,
        );

        return;
      }

      const textInputValueCustomMetadata =
        this.metadataProvider.getTextInputValueDecoratorMetadata(
          metatype,
          property,
        );
      if (textInputValueCustomMetadata && interaction.fields) {
        plainObject[property] = interaction.fields.getTextInputValue(
          textInputValueCustomMetadata.customId ?? property,
        );

        return;
      }
    });

    return plainToInstance(metatype, plainObject, this.classTransformerOptions);
  }

  private isDto(type: Type): boolean {
    try {
      const instance = new type();
      const allProperties = Object.keys(instance);

      return allProperties.some(
        (property) =>
          !!(
            this.metadataProvider.getParamDecoratorMetadata(type, property) ||
            this.metadataProvider.getArgNumDecoratorMetadata(type, property) ||
            this.metadataProvider.getArgNumDecoratorMetadata(type, property) ||
            this.metadataProvider.getFiledDecoratorMetadata(type, property) ||
            this.metadataProvider.getTextInputValueDecoratorMetadata(
              type,
              property,
            )
          ),
      );
    } catch {
      return false;
    }
  }
}
