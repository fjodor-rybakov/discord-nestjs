import { Command, DiscordCommand } from '@discord-nestjs/core';
import { ContextMenuInteraction } from 'discord.js';
import { ApplicationCommandTypes } from 'discord.js/typings/enums';

@Command({
  name: 'playlist',
  type: ApplicationCommandTypes.USER,
})
export class PlaylistCommand implements DiscordCommand {
  handler(interaction: ContextMenuInteraction): string {
    return 'Your playlist...';
  }
}
