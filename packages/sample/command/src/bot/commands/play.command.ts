import { TransformPipe } from '@discord-nestjs/common';
import {
  Command,
  DiscordTransformedCommand,
  Param,
  Payload,
  UsePipes,
} from '@discord-nestjs/core';
import { CommandInteraction } from 'discord.js';

export class PlayDto {
  @Param({
    name: 'song',
    description:
      'Name or URL of song/playlist. Could be from (Youtube, Spotify, SoundCloud)',
    required: true,
  })
  song: string;
}

@Command({
  name: 'test',
  description: 'Plays a song',
})
@UsePipes(TransformPipe)
export class PlayCommand implements DiscordTransformedCommand<PlayDto> {
  handler(@Payload() dto: PlayDto, interaction: CommandInteraction): string {
    console.log('DTO', dto);
    console.log('Interaction', interaction);

    return 'Nice.';
  }
}
