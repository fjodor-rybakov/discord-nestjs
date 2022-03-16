import { Injectable } from '@nestjs/common';

import { DiscordModuleOption } from '../definitions/interfaces/discord-module-options';
import { InternalDiscordModuleOption } from '../definitions/interfaces/internal-discord-module-option';

@Injectable()
export class DiscordOptionService {
  private options: InternalDiscordModuleOption;

  constructor() {
    this.options = {
      token: null,
      discordClientOptions: {
        intents: [],
      },
      useGuards: [],
      usePipes: [],
      useFilters: [],
    };
  }

  setDefault(options: DiscordModuleOption): void {
    const { autoRegisterGlobalCommands, removeGlobalCommands } = options;

    this.options = {
      ...this.options,
      ...options,
      autoRegisterGlobalCommands: autoRegisterGlobalCommands || false,
      removeGlobalCommands: removeGlobalCommands || false,
    };
  }

  addPipe(pipe: InstanceType<any>): number {
    return this.options.usePipes.push(pipe);
  }

  addGuard(guard: InstanceType<any>): number {
    return this.options.useGuards.push(guard);
  }

  addFilter(filter: InstanceType<any>): number {
    return this.options.useFilters.push(filter);
  }

  getClientData(): InternalDiscordModuleOption {
    return this.options;
  }
}
