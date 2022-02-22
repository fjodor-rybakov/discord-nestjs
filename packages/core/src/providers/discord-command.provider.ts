import { Injectable, Type } from '@nestjs/common';
import { ApplicationCommandData } from 'discord.js';

@Injectable()
export class DiscordCommandProvider {
  private readonly commands = new Map<Type, ApplicationCommandData>();

  addCommand(type: Type, command: ApplicationCommandData) {
    this.commands.set(type, command);
  }

  getAllCommands(): Map<Type, ApplicationCommandData> {
    return this.commands;
  }
}
