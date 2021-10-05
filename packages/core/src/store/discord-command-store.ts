import { Injectable } from '@nestjs/common';
import { ChatInputApplicationCommandData } from 'discord.js';

@Injectable()
export class DiscordCommandStore {
  private readonly commandList: ChatInputApplicationCommandData[] = [];

  addCommand(command: ChatInputApplicationCommandData) {
    this.commandList.push(command);
  }

  getAllCommands(): ChatInputApplicationCommandData[] {
    return this.commandList;
  }
}
