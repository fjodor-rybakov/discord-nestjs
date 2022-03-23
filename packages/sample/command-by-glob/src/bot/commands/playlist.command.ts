import { Command, DiscordCommand } from '@discord-nestjs/core';
import { Injectable } from '@nestjs/common';
import { CommandInteraction } from 'discord.js';
import { ApplicationCommandTypes } from 'discord.js/typings/enums';

@Injectable()
@Command({
  name: 'playlist',
  type: ApplicationCommandTypes.USER,
})
export class PlaylistCommand implements DiscordCommand {
  handler(interaction: CommandInteraction): string {
    return 'Your playlist...';
  }
}
