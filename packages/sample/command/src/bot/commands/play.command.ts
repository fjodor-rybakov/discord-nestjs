import { TransformPipe } from '@discord-nestjs/common';
import {
  Command,
  DiscordTransformedCommand,
  Payload,
  TransformedCommandExecutionContext,
  UsePipes,
} from '@discord-nestjs/core';
import { Injectable } from '@nestjs/common';

import { PlayDto } from '../dto/play.dto';

@Injectable()
@Command({
  name: 'play',
  description: 'Plays a song',
})
@UsePipes(TransformPipe)
export class PlayCommand implements DiscordTransformedCommand<PlayDto> {
  handler(
    @Payload() dto: PlayDto,
    { interaction }: TransformedCommandExecutionContext,
  ): string {
    console.log('DTO', dto);
    console.log('Interaction', interaction);

    return `Start playing ${dto.song}.`;
  }
}
