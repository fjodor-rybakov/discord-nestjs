import { ReflectMetadataProvider } from '@discord-nestjs/core';
import {
  ArgumentMetadata,
  Inject,
  Injectable,
  Optional,
  PipeTransform,
} from '@nestjs/common';
import { ClassTransformOptions, plainToInstance } from 'class-transformer';
import { Interaction } from 'discord.js';

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
      !interaction ||
      typeof interaction['isChatInputCommand'] !== 'function' ||
      !interaction.isChatInputCommand()
    )
      return interaction;

    const plainObject = {};
    const dtoInstance = new metadata.metatype();
    const allKeys = Object.keys(dtoInstance);

    allKeys.forEach((property: string) => {
      const paramDecoratorMetadata =
        this.metadataProvider.getParamDecoratorMetadata(
          metadata.metatype,
          property,
        );

      if (!paramDecoratorMetadata) return;

      const { name, required } = paramDecoratorMetadata;
      plainObject[property] =
        interaction.options.get(name ?? property, required)?.value ??
        dtoInstance[property];
    });

    return plainToInstance(
      metadata.metatype,
      plainObject,
      this.classTransformerOptions,
    );
  }
}
