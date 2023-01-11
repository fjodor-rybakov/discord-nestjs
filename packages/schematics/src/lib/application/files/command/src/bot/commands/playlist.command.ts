import { Command, Handler } from '@discord-nestjs/core';
import {
  ApplicationCommandType,
  ContextMenuCommandInteraction,
} from 'discord.js';

@Command({
  name: 'playlist',
  type: ApplicationCommandType.User,
})
export class PlaylistCommand {
  @Handler()
  onPlaylistCommand(interaction: ContextMenuCommandInteraction): string {
    return 'Your playlist...';
  }
}
