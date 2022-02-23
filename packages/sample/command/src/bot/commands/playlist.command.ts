import { Command, DiscordCommand } from '@discord-nestjs/core';
import { CommandInteraction } from 'discord.js';

@Command({
  name: 'playlist',
  description: 'Your playlist',
})
export class PlaylistCommand implements DiscordCommand {
  handler(interaction: CommandInteraction): string {
    return 'Your playlist...';
  }
}
