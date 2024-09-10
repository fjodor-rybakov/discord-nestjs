import { Injectable, Type } from '@nestjs/common';
import {
  ApplicationCommandOptionChoiceData,
  ApplicationCommandOptionType,
  ChannelType,
} from 'discord.js';

import { ParamOptions } from '../../decorators/option/param/param-options';
import { ParamType } from '../../definitions/types/param.type';
import { ReflectMetadataProvider } from '../../providers/reflect-metadata.provider';
import { OptionMetadata } from './option-metadata';

@Injectable()
export class OptionExplorer {
  constructor(private readonly metadataProvider: ReflectMetadataProvider) {}

  explore(dtoType: Type): OptionMetadata {
    const optionMetadata: OptionMetadata = {};
    const dtoInstance = new dtoType();

    Object.keys(dtoInstance).map((propertyKey: string) => {
      const paramDecoratorMetadata =
        this.metadataProvider.getParamDecoratorMetadata(dtoType, propertyKey);
      const channelTypes = this.getChannelOptions(dtoType, propertyKey);
      const applicationOptionType = channelTypes
        ? ApplicationCommandOptionType.Channel
        : this.getApplicationOptionTypeByArg(
            dtoInstance,
            propertyKey,
            paramDecoratorMetadata,
          );
      optionMetadata[propertyKey] = {
        param: {
          ...paramDecoratorMetadata,
          name: paramDecoratorMetadata.name ?? propertyKey,
          type: applicationOptionType,
        },
        choice: this.getChoiceOptions(dtoType, propertyKey),
        channelTypes,
      };
    });

    return optionMetadata;
  }

  private getChoiceOptions(
    dtoType: Type,
    propertyKey: string,
  ): ApplicationCommandOptionChoiceData[] {
    const choiceData = this.metadataProvider.getChoiceDecoratorMetadata(
      dtoType,
      propertyKey,
    );
    if (!choiceData) return;

    const isMap = choiceData instanceof Map;

    const entries = isMap
      ? Array.from(choiceData)
      : Object.entries(choiceData).filter(
          ([key]) => !(key in Object.keys(choiceData)),
        );

    return entries.map(([name, value]) => {
      if (typeof value === 'object') {
        return { name, ...value };
      }

      return { name, value };
    });
  }

  private getChannelOptions(dtoType: Type, propertyKey: string): ChannelType[] {
    return this.metadataProvider.getChannelDecoratorMetadata(
      dtoType,
      propertyKey,
    );
  }

  private getApplicationOptionTypeByArg(
    instance: InstanceType<any>,
    propertyKey: string,
    argDecoratorOptions: ParamOptions,
  ): ApplicationCommandOptionType {
    switch (argDecoratorOptions.type) {
      case ParamType.STRING:
        return ApplicationCommandOptionType.String;
      case ParamType.BOOLEAN:
        return ApplicationCommandOptionType.Boolean;
      case ParamType.INTEGER:
        return ApplicationCommandOptionType.Integer;
      case ParamType.NUMBER:
        return ApplicationCommandOptionType.Number;
      case ParamType.ROLE:
        return ApplicationCommandOptionType.Role;
      case ParamType.MENTIONABLE:
        return ApplicationCommandOptionType.Mentionable;
      case ParamType.USER:
        return ApplicationCommandOptionType.User;
      case ParamType.ATTACHMENT:
        return ApplicationCommandOptionType.Attachment;
      case ParamType.CHANNEL:
        return ApplicationCommandOptionType.Channel;
      default: {
        const metatype = this.metadataProvider.getPropertyTypeMetadata(
          instance,
          propertyKey,
        );
        if (metatype.name === 'String')
          return ApplicationCommandOptionType.String;

        if (metatype.name === 'Boolean')
          return ApplicationCommandOptionType.Boolean;

        throw new Error(
          `Could not determine field type "${propertyKey}" in class "${instance.constructor.name}"`,
        );
      }
    }
  }
}
