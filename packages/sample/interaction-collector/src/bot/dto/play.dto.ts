import { CommandOptions, Param } from '@discord-nestjs/core';

@CommandOptions()
export class PlayDto {
  @Param({
    name: 'song',
    description:
      'Name or URL of song/playlist. Could be from (Youtube, Spotify, SoundCloud)',
    required: true,
  })
  song: string;
}
