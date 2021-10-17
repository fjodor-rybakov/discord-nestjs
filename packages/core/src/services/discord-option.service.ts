import { Inject, Injectable } from '@nestjs/common';
import { DISCORD_MODULE_OPTIONS } from '../definitions/constants/discord-module.contant';
import { DiscordModuleOption } from '../definitions/interfaces/discord-module-options';

@Injectable()
export class DiscordOptionService {
  constructor(
    @Inject(DISCORD_MODULE_OPTIONS)
    private readonly options: DiscordModuleOption,
  ) {
    this.setDefault(this.options);
  }

  getClientData(): DiscordModuleOption {
    return this.options;
  }

  private setDefault(options: DiscordModuleOption): void {
    const { useGuards, usePipes, commands } = options;

    Object.assign(options, {
      useGuards: useGuards ?? [],
      usePipes: usePipes ?? [],
      commands: commands ?? [],
      autoRegisterCommands: true,
    });
  }
}
