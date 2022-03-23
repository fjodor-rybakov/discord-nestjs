import { Command, DiscordCommand } from '@discord-nestjs/core';
import { Injectable } from '@nestjs/common';
import { CommandInteraction } from 'discord.js';

@Injectable()
@Command({
  name: 'playlist',
  description: 'Your playlist',
})
export class PlaylistCommand implements DiscordCommand {
  handler(interaction: CommandInteraction): string {
    return 'Your playlist...';
  }
}
