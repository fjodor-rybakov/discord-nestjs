import { SlashCommandPipe } from '@discord-nestjs/common';
import {
  Command,
  EventParams,
  Handler,
  InteractionEvent,
} from '@discord-nestjs/core';
import { Injectable } from '@nestjs/common';
import { ClientEvents } from 'discord.js';

import { PlayDto } from '../dto/play.dto';

@Injectable()
@Command({
  name: 'play',
  description: 'Plays a song',
})
export class PlayCommand {
  @Handler()
  onPlayCommand(
    @InteractionEvent(SlashCommandPipe) dto: PlayDto,
    @EventParams() args: ClientEvents['interactionCreate'],
  ): string {
    console.log('DTO', dto);
    console.log('Event args', args);

    return `Start playing ${dto.song}.`;
  }
}
