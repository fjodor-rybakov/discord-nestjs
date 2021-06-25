import { Injectable } from '@nestjs/common';
import { DiscordAPIError, MessageEmbed } from 'discord.js';
import { ValidationError } from 'class-validator';
import { TransformProvider } from './transform.provider';
import { ArgRangeOptions } from '../decorator/interface/arg-range-options';

@Injectable()
export class ValidationProvider {
  private errorMessage: MessageEmbed;

  constructor(private readonly transformProvider: TransformProvider) {}

  getDefaultErrorMessage(
    err: Error | ValidationError[] | DiscordAPIError,
    messageContent: string,
  ): MessageEmbed {
    if (err instanceof Array && err[0] instanceof ValidationError) {
      return new MessageEmbed()
        .setColor('#d21111')
        .setTitle('Your input is incorrect')
        .addFields(
          err.map((errItem: ValidationError) => {
            const positions = this.transformProvider.getArgPositions(
              errItem.target,
              errItem.property,
            );
            const causeValue = this.getCauseValue(positions, messageContent);

            const name = this.getCauseName(positions);
            const value = Object.values(errItem.constraints).map(
              (item: string) => this.replaceStringValue(item, causeValue),
            );

            return {
              inline: true,
              name,
              value,
            };
          }),
        );
    }
    if (err instanceof DiscordAPIError) {
      return new MessageEmbed().setColor('#d21111').setTitle(err.message);
    }
    return new MessageEmbed()
      .setColor('#d21111')
      .setTitle('Something unexpected happened');
  }

  setErrorMessage(messageEmbed: MessageEmbed): void {
    this.errorMessage = messageEmbed;
  }

  getErrorMessage(): MessageEmbed {
    return this.errorMessage;
  }

  private getCauseName(positions: ArgRangeOptions): string {
    let name = '';
    if (positions.formPosition !== undefined) {
      // positions.formPosition + 1 for human readable
      if (positions.toPosition) {
        name += `from position: ${positions.formPosition + 1}, to position: ${
          positions.toPosition
        }`;
      } else {
        name += `at position: ${positions.formPosition + 1}`;
      }
    }
    return name;
  }

  private getCauseValue(
    positions: ArgRangeOptions,
    messageContent: string,
  ): string | null {
    const messageParts = messageContent.split(' ');
    const inputValue = messageParts
      .slice(
        positions.formPosition,
        positions.toPosition ?? positions.formPosition + 1,
      )
      .join(' ');
    if (!inputValue) {
      return null;
    }
    return `**__${inputValue}__**`;
  }

  private replaceStringValue(
    inputString: string,
    replaceValue: string,
  ): string {
    const itemParts = inputString.split(' ');
    itemParts.splice(0, 1, replaceValue);
    return ` - ${itemParts.join(' ')}`;
  }
}
