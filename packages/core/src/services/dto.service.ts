import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import {
  ApplicationCommandAutocompleteOption,
  ApplicationCommandChannelOptionData,
  ApplicationCommandChoicesData,
  ApplicationCommandNonOptionsData,
  ApplicationCommandNumericOptionData,
  ApplicationCommandStringOptionData,
} from 'discord.js';

import { OptionExplorer } from '../explorers/option/option.explorer';
import { ParamExplorer } from '../explorers/param/param.explorer';

export type NonCommandData =
  | ApplicationCommandNonOptionsData
  | ApplicationCommandChannelOptionData
  | ApplicationCommandChoicesData
  | ApplicationCommandAutocompleteOption
  | ApplicationCommandStringOptionData
  | ApplicationCommandNumericOptionData;

@Injectable()
export class DtoService {
  constructor(
    private readonly paramExplorer: ParamExplorer,
    private readonly moduleRef: ModuleRef,
    private readonly optionExplorer: OptionExplorer,
  ) {}

  async createDtoInstance(
    instance: InstanceType<any>,
    methodName: string,
  ): Promise<InstanceType<any>> {
    const payloadType = this.paramExplorer.getPayloadType(instance, methodName);

    if (!payloadType) return;

    return this.moduleRef.create(payloadType);
  }

  exploreDtoOptions(dtoInstance: InstanceType<any>): NonCommandData[] {
    const optionMetadata = this.optionExplorer.explore(dtoInstance);
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

    return commandOptions;
  }
}
