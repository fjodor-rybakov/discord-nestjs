import { Command, DiscordCommand } from '@discord-nestjs/core';
import {
  ApplicationCommandType,
  UserContextMenuCommandInteraction,
} from 'discord.js';

@Command({
  name: 'playlist',
  type: ApplicationCommandType.User,
})
export class PlaylistCommand implements DiscordCommand {
  handler(interaction: UserContextMenuCommandInteraction): string {
    return 'Your playlist...';
  }
}
