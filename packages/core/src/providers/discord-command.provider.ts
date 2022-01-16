import { Injectable } from '@nestjs/common';
import { ApplicationCommandData } from 'discord.js';

@Injectable()
export class DiscordCommandProvider {
  private readonly commandList: ApplicationCommandData[] = [];

  addCommand(command: ApplicationCommandData) {
    this.commandList.push(command);
  }

  getAllCommands(): ApplicationCommandData[] {
    return this.commandList;
  }
}
