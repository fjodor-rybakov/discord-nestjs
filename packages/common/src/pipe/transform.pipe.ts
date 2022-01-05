import {
  DiscordArgumentMetadata,
  DiscordPipeTransform,
  ReflectMetadataProvider,
} from '@discord-nestjs/core';
import { Injectable } from '@nestjs/common';
import { Interaction } from 'discord.js';

/**
 * Fills DTO with values from interaction
 */
@Injectable()
export class TransformPipe implements DiscordPipeTransform {
  constructor(private readonly metadataProvider: ReflectMetadataProvider) {}

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
        interaction.options.get(name ?? property, required)?.value ||
        originalInstance[property];
    });

    return newInstance;
  }
}
