import { Injectable } from '@nestjs/common';
import { MessageEmbed } from 'discord.js';
import { ValidationError } from 'class-validator';
import { TransformProvider } from './transform.provider';

@Injectable()
export class ValidationProvider {
  constructor(
    private readonly transformProvider: TransformProvider,
  ) {
  }

  defaultErrorMessage(err: ValidationError[], messageContent: string): MessageEmbed {
    return new MessageEmbed()
      .setColor('#d21111')
      .setTitle('Your input is incorrect')
      .addFields(err.map((errItem: ValidationError) => {
        const positions = this.transformProvider.getArgPositions(errItem.target, errItem.property, messageContent.split(' ').length);
        const value = Object.values(errItem.constraints)
          .map((item: string) => ` - ${item}`);

        let name = `Property: ${errItem.property}`
        if (positions.formPosition !== undefined) {
          if (positions.toPosition) {
            name += `(from position: ${positions.formPosition}, to position: ${positions.toPosition})`;
          } else {
            name += `(at position: ${positions.formPosition})`;
          }
        }

        return {
          inline: true,
          name,
          value
        };
      }));
  }
}