import { Injectable } from '@nestjs/common';

import { DiscordExceptionFilter } from '../decorators/filter/discord-exception-filter';
import { DiscordGuard } from '../decorators/guard/discord-guard';
import { DiscordPipeTransform } from '../decorators/pipe/discord-pipe-transform';
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
      registerCommandOptions: [{}],
    };
  }

  setDefault(options: DiscordModuleOption): void {
    const { autoLogin } = options;

    this.options = {
      ...this.options,
      ...options,
      autoLogin: autoLogin ?? true,
    };
  }

  addPipe(pipe: DiscordPipeTransform): number {
    return this.options.usePipes.push(pipe);
  }

  addGuard(guard: DiscordGuard): number {
    return this.options.useGuards.push(guard);
  }

  addFilter(filter: DiscordExceptionFilter): number {
    return this.options.useFilters.push(filter);
  }

  getClientData(): InternalDiscordModuleOption {
    return this.options;
  }
}
