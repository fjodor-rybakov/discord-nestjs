import {
  DiscordArgumentMetadata,
  DiscordPipeTransform,
  ReflectMetadataProvider,
} from '@discord-nestjs/core';
import { Inject, Injectable, Optional } from '@nestjs/common';
import { ClassTransformOptions, instanceToInstance } from 'class-transformer';
import { Interaction } from 'discord.js';

import { TRANSFORMER_OPTION } from '../transformer-options.constant';

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
  ): any {
    if (!metadata.metatype || !interaction || !interaction.isCommand()) return;

    const { dtoInstance: originalInstance } = metadata.commandNode;
    const newInstance = Object.assign(
      Object.create(Object.getPrototypeOf(originalInstance)),
      originalInstance,
    );

    Object.keys(originalInstance).forEach((property: string) => {
      const paramDecoratorMetadata =
        this.metadataProvider.getParamDecoratorMetadata(
          originalInstance,
          property,
        );

      if (!paramDecoratorMetadata) return;

      const { name, required } = paramDecoratorMetadata;
      newInstance[property] =
        interaction.options.get(name ?? property, required)?.value ??
        originalInstance[property];
    });

    return instanceToInstance(newInstance, this.classTransformerOptions);
  }
}
