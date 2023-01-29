import { Command, Handler } from '@discord-nestjs/core';
import { Injectable } from '@nestjs/common';
import { ApplicationCommandType, CommandInteraction } from 'discord.js';

@Injectable()
@Command({
  name: 'playlist',
  type: ApplicationCommandType.User,
})
export class PlaylistCommand {
  @Handler()
  onPlaylistCommand(interaction: CommandInteraction): string {
    return 'Your playlist...';
  }
}
