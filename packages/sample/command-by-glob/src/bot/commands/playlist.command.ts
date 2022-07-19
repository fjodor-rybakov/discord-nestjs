import { Command, DiscordCommand } from '@discord-nestjs/core';
import { Injectable } from '@nestjs/common';
import { ApplicationCommandType, CommandInteraction } from 'discord.js';

@Injectable()
@Command({
  name: 'playlist',
  type: ApplicationCommandType.User,
})
export class PlaylistCommand implements DiscordCommand {
  handler(interaction: CommandInteraction): string {
    return 'Your playlist...';
  }
}
