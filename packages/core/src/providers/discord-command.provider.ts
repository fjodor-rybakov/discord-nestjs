import { Injectable, Type } from '@nestjs/common';

import { AppCommandData } from '../definitions/interfaces/app-command-data';

@Injectable()
export class DiscordCommandProvider {
  private readonly commands = new Map<Type, AppCommandData>();

  addCommand(type: Type, command: AppCommandData) {
    this.commands.set(type, command);
  }

  getAllCommands(): Map<Type, AppCommandData> {
    return this.commands;
  }
}
