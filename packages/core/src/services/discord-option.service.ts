import { Injectable } from '@nestjs/common';

import { DiscordModuleOption } from '../definitions/interfaces/discord-module-options';

@Injectable()
export class DiscordOptionService {
  private options: DiscordModuleOption;

  updateOptions(options): DiscordModuleOption {
    this.options = this.setDefault(options);

    return this.options;
  }

  getClientData(): DiscordModuleOption {
    return this.options;
  }

  private setDefault(options: DiscordModuleOption): DiscordModuleOption {
    const {
      useGuards,
      usePipes,
      useFilters,
      commands,
      autoRegisterGlobalCommands,
      removeGlobalCommands,
    } = options;

    return {
      ...options,
      useGuards: useGuards ?? [],
      usePipes: usePipes ?? [],
      useFilters: useFilters ?? [],
      commands: commands ?? [],
      autoRegisterGlobalCommands: autoRegisterGlobalCommands || false,
      removeGlobalCommands: removeGlobalCommands || false,
    };
  }
}
