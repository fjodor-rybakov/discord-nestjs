import { Injectable } from '@nestjs/common';

import { DiscordModuleOption } from '../definitions/interfaces/discord-module-options';

@Injectable()
export class OptionService {
  private options: DiscordModuleOption;

  constructor() {
    this.options = {
      token: null,
      discordClientOptions: {
        intents: [],
      },
      registerCommandOptions: [{}],
      autoLogin: true,
      failOnLogin: false,
      shutdownOnAppDestroy: true,
      isTrowForbiddenException: false,
    };
  }

  updateOptions(options: DiscordModuleOption): void {
    this.options = {
      ...this.options,
      ...options,
    };
  }

  getClientData(): DiscordModuleOption {
    return this.options;
  }
}
