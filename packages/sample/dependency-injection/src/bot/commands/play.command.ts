import { SlashCommandPipe } from '@discord-nestjs/common';
import { Command, Handler, IA } from '@discord-nestjs/core';

import { PlayDto } from '../dto/play.dto';
import { PlayService } from '../services/play.service';

@Command({
  name: 'play',
  description: 'Plays a song',
})
export class PlayCommand {
  constructor(private readonly playService: PlayService) {}

  @Handler()
  onPlayCommand(@IA(SlashCommandPipe) dto: PlayDto): string {
    return this.playService.play(dto.song);
  }
}
