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

    const { dtoInstance } = metadata.commandNode;

    Object.keys(dtoInstance).forEach((property: string) => {
      const argDecoratorOptions = this.metadataProvider.getArgDecoratorMetadata(
        dtoInstance,
        property,
      );

      if (!argDecoratorOptions) return;

      const { name, required } = argDecoratorOptions;
      dtoInstance[property] = interaction.options.get(
        name ?? property,
        required,
      )?.value;
    });

    return dtoInstance;
  }
}
