import { TransformPipe } from '@discord-nestjs/common';
import {
  Command,
  DiscordTransformedCommand,
  Payload,
  UsePipes,
} from '@discord-nestjs/core';
import { CommandInteraction } from 'discord.js';

import { PlayDto } from '../dto/play.dto';
import { PlayService } from '../services/play.service';

@Command({
  name: 'play',
  description: 'Plays a song',
})
@UsePipes(TransformPipe)
export class PlayCommand implements DiscordTransformedCommand<PlayDto> {
  constructor(private readonly playService: PlayService) {}

  handler(@Payload() dto: PlayDto, interaction: CommandInteraction): string {
    return this.playService.play(dto.song);
  }
}
