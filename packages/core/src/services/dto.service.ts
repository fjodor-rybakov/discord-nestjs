import { Injectable, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import {
  ApplicationCommandAutocompleteNumericOptionData,
  ApplicationCommandAutocompleteStringOptionData,
  ApplicationCommandBooleanOptionData,
  ApplicationCommandChannelOptionData,
  ApplicationCommandMentionableOptionData,
  ApplicationCommandNonOptionsData,
  ApplicationCommandNumericOptionData,
  ApplicationCommandRoleOptionData,
  ApplicationCommandStringOptionData,
  ApplicationCommandUserOptionData,
} from 'discord.js';
import { filter, from, lastValueFrom, map, toArray } from 'rxjs';

import { OptionExplorer } from '../explorers/option/option.explorer';
import { ReflectMetadataProvider } from '../providers/reflect-metadata.provider';

export type NonCommandData =
  | ApplicationCommandNonOptionsData
  | ApplicationCommandChannelOptionData
  | ApplicationCommandAutocompleteNumericOptionData
  | ApplicationCommandAutocompleteStringOptionData
  | ApplicationCommandNumericOptionData
  | ApplicationCommandStringOptionData
  | ApplicationCommandRoleOptionData
  | ApplicationCommandUserOptionData
  | ApplicationCommandMentionableOptionData
  | ApplicationCommandBooleanOptionData;

@Injectable()
export class DtoService {
  constructor(
    private readonly metadataProvider: ReflectMetadataProvider,
    private readonly moduleRef: ModuleRef,
    private readonly optionExplorer: OptionExplorer,
  ) {}

  async getDtoMetatype(
    commandInstance: InstanceType<any>,
    methodName: string,
  ): Promise<InstanceType<any>> {
    const paramsTypes = this.metadataProvider.getParamTypesMetadata(
      commandInstance,
      methodName,
    );
    if (!paramsTypes) return;

    const [commandOption] = await lastValueFrom(
      from(paramsTypes).pipe(
        map((type) => {
          return {
            type,
            isDto: this.isDto(type),
          };
        }),
        filter(({ isDto }) => isDto),
        toArray(),
      ),
    );
    if (!commandOption) return;

    return commandOption.type;
  }

  exploreDtoOptions(dtoType: Type): NonCommandData[] {
    const optionMetadata = this.optionExplorer.explore(dtoType);
    const commandOptions: NonCommandData[] = [];
    for (const property in optionMetadata) {
      const propertyOptions = optionMetadata[property];
      const {
        name,
        description,
        required = false,
        type,
        minValue,
        maxValue,
        minLength,
        maxLength,
        autocomplete,
        nameLocalizations,
        descriptionLocalizations,
      } = propertyOptions.param;

      commandOptions.push({
        name,
        description,
        required,
        type,
        autocomplete,
        minValue,
        maxValue,
        minLength,
        maxLength,
        nameLocalizations,
        descriptionLocalizations,
        choices: propertyOptions.choice,
        channelTypes: propertyOptions.channelTypes,
      });
    }

    return this.sortByRequired(commandOptions);
  }

  private sortByRequired<TOption extends { required?: boolean }>(
    options: TOption[],
  ): TOption[] {
    return options.sort((first, second) =>
      first.required > second.required ? -1 : 1,
    );
  }

  private isDto(type: Type): boolean {
    try {
      const instance = new type();
      const allProperties = Object.keys(instance);

      return allProperties.some(
        (property) =>
          !!(
            this.metadataProvider.getParamDecoratorMetadata(type, property) ||
            this.metadataProvider.getArgNumDecoratorMetadata(type, property) ||
            this.metadataProvider.getArgNumDecoratorMetadata(type, property) ||
            this.metadataProvider.getFiledDecoratorMetadata(type, property) ||
            this.metadataProvider.getTextInputValueDecoratorMetadata(
              type,
              property,
            )
          ),
      );
    } catch {
      return false;
    }
  }
}
