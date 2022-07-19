import {
  DiscordArgumentMetadata,
  DiscordPipeTransform,
  ReflectMetadataProvider,
} from '@discord-nestjs/core';
import { Inject, Injectable, Optional } from '@nestjs/common';
import { ClassTransformOptions, plainToInstance } from 'class-transformer';
import { Interaction } from 'discord.js';

import { TRANSFORMER_OPTION } from '../contants/transformer-options.constant';

/**
 * Fills DTO with values from interaction
 */
@Injectable()
export class TransformPipe implements DiscordPipeTransform {
  constructor(
    private readonly metadataProvider: ReflectMetadataProvider,
    @Optional()
    @Inject(TRANSFORMER_OPTION)
    private readonly classTransformerOptions?: ClassTransformOptions,
  ) {}

  transform(
    interaction: Interaction,
    metadata: DiscordArgumentMetadata<'interactionCreate'>,
  ): InstanceType<any> {
    if (!metadata.metatype || !interaction || !interaction.isChatInputCommand())
      return;

    const { dtoInstance } = metadata.commandNode;
    const plainObject = {};

    Object.keys(dtoInstance).forEach((property: string) => {
      const paramDecoratorMetadata =
        this.metadataProvider.getParamDecoratorMetadata(dtoInstance, property);

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
