import { Injectable } from '@nestjs/common';
import { ReflectMetadataProvider } from '../../providers/reflect-metadata.provider';
import { OptionMetadata } from './option-metadata';
import { ArgType } from '../../definitions/types/arg.type';
import {
  ApplicationCommandOptionTypes,
  ChannelTypes,
} from 'discord.js/typings/enums';
import { ArgOptions } from '../../decorators/option/arg/arg-options';
import {
  ApplicationCommandOptionChoice,
  CommandOptionChannelResolvableType,
  CommandOptionChoiceResolvableType,
  CommandOptionNonChoiceResolvableType,
} from 'discord.js';
import { ExcludeEnum } from '../../definitions/types/exclude-enum.type';

@Injectable()
export class OptionResolver {
  constructor(private readonly metadataProvider: ReflectMetadataProvider) {}

  resolve(dtoInstance: any): OptionMetadata {
    const optionMetadata: OptionMetadata = {};

    Object.keys(dtoInstance).map((propertyKey: string) => {
      const argDecoratorOptions = this.metadataProvider.getArgDecoratorMetadata(
        dtoInstance,
        propertyKey,
      );
      const channelTypes = this.getChannelOptions(dtoInstance, propertyKey);
      const applicationOptionType = channelTypes
        ? ApplicationCommandOptionTypes.CHANNEL
        : this.getApplicationOptionTypeByArg(
            dtoInstance,
            propertyKey,
            argDecoratorOptions,
          );
      optionMetadata[propertyKey] = {
        arg: {
          name: argDecoratorOptions.name ?? propertyKey,
          description: argDecoratorOptions.description,
          type: applicationOptionType,
          required: argDecoratorOptions.required,
        },
        choice: this.getChoiceOptions(dtoInstance, propertyKey),
        channelTypes,
      };
    });

    return optionMetadata;
  }

  private getChoiceOptions(
    dtoInstance: any,
    propertyKey: string,
  ): ApplicationCommandOptionChoice[] {
    const choiceData = this.metadataProvider.getChoiceDecoratorMetadata(
      dtoInstance,
      propertyKey,
    );
    if (!choiceData) {
      return;
    }

    const rawValues = Object.entries(choiceData);
    const values = rawValues.slice(rawValues.length / 2);

    return values.map(([name, value]) => ({ name, value }));
  }

  private getChannelOptions(
    dtoInstance: any,
    propertyKey: string,
  ): ExcludeEnum<typeof ChannelTypes, 'UNKNOWN'>[] {
    const channelTypes = this.metadataProvider.getChannelDecoratorMetadata(
      dtoInstance,
      propertyKey,
    );
    if (!channelTypes) {
      return;
    }

    return channelTypes;
  }

  private getApplicationOptionTypeByArg(
    dtoInstance: any,
    propertyKey: string,
    argDecoratorOptions: ArgOptions,
  ):
    | CommandOptionChoiceResolvableType
    | CommandOptionNonChoiceResolvableType
    | CommandOptionChannelResolvableType {
    switch (argDecoratorOptions.type) {
      case ArgType.STRING:
        return ApplicationCommandOptionTypes.STRING;
      case ArgType.BOOLEAN:
        return ApplicationCommandOptionTypes.BOOLEAN;
      case ArgType.INTEGER:
        return ApplicationCommandOptionTypes.INTEGER;
      case ArgType.NUMBER:
        return ApplicationCommandOptionTypes.NUMBER;
      case ArgType.ROLE:
        return ApplicationCommandOptionTypes.ROLE;
      case ArgType.MENTIONABLE:
        return ApplicationCommandOptionTypes.MENTIONABLE;
      case ArgType.USER:
        return ApplicationCommandOptionTypes.USER;
      default: {
        const metatype = this.metadataProvider.getPropertyTypeMetadata(
          dtoInstance,
          propertyKey,
        );
        if (metatype.name === 'String') {
          return ApplicationCommandOptionTypes.STRING;
        }
        if (metatype.name === 'Boolean') {
          return ApplicationCommandOptionTypes.BOOLEAN;
        }

        throw new Error(
          `Could not determine field type ${propertyKey} in class ${dtoInstance.constructor.name}`,
        );
      }
    }
  }
}
