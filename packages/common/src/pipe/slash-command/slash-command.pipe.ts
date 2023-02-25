import { ParamType, ReflectMetadataProvider } from '@discord-nestjs/core';
import {
  ArgumentMetadata,
  Inject,
  Injectable,
  Optional,
  PipeTransform,
} from '@nestjs/common';
import { ClassTransformOptions, plainToInstance } from 'class-transformer';
import { Attachment, Interaction } from 'discord.js';

import { TRANSFORMER_OPTION } from '../../contants/transformer-options.constant';

/**
 * Fills DTO with values from interaction
 */
@Injectable()
export class SlashCommandPipe implements PipeTransform {
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
    if (
      !metadata.metatype ||
      !this.metadataProvider.isDto(metadata.metatype) ||
      !interaction ||
      typeof interaction['isChatInputCommand'] !== 'function' ||
      !interaction.isChatInputCommand()
    )
      return interaction;

    const plainObject = {};
    const dtoInstance = new metadata.metatype();
    const allKeys = Object.keys(dtoInstance);
    const assignWithoutTransform: Record<string, any> = {};

    allKeys.forEach((property: string) => {
      const paramDecoratorMetadata =
        this.metadataProvider.getParamDecoratorMetadata(
          metadata.metatype,
          property,
        );

      if (!paramDecoratorMetadata) return;

      const { required, type } = paramDecoratorMetadata;
      const name = paramDecoratorMetadata.name ?? property;
      const interactionOption = interaction.options.get(name, required);

      plainObject[property] = interactionOption?.value ?? dtoInstance[property];

      if (type === ParamType.ATTACHMENT) {
        const propertyType = Reflect.getMetadata(
          'design:type',
          dtoInstance,
          property,
        );

        if (Object.is(propertyType, Attachment)) {
          assignWithoutTransform[property] =
            interactionOption?.attachment ?? dtoInstance[property];
        }
      }
    });

    // class-validator breaks classes trying to recreate an instance from a property type
    const resultDto = plainToInstance(
      metadata.metatype,
      plainObject,
      this.classTransformerOptions,
    );

    return Object.assign(resultDto, assignWithoutTransform);
  }
}
