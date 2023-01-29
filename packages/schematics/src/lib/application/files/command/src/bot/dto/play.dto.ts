import { Param } from '@discord-nestjs/core';
import { ChatInputCommandOptions } from '@discord-nestjs/core/src';
import { Transform } from 'class-transformer';

@CommandOptions()
export class PlayDto {
  @Transform(({ value }) => value.toUpperCase())
  @Param({
    name: 'song',
    description:
      'Name or URL of song/playlist. Could be from (Youtube, Spotify, SoundCloud)',
    required: true,
  })
  song: string;
}
