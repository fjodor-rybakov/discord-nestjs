import { Command, DiscordCommand } from '@discord-nestjs/core';
import {
  ApplicationCommandType,
  ContextMenuCommandInteraction,
} from 'discord.js';

@Command({
  name: 'playlist',
  type: ApplicationCommandType.User,
})
export class PlaylistCommand implements DiscordCommand {
  handler(interaction: ContextMenuCommandInteraction): string {
    return 'Your playlist...';
  }
}
