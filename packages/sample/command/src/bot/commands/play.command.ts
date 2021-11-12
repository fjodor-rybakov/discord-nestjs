import { TransformPipe } from '@discord-nestjs/common';
import {
  Command,
  DiscordTransformedCommand,
  Payload,
  UsePipes,
} from '@discord-nestjs/core';
import { CommandInteraction } from 'discord.js';

import { PlayDto } from '../dto/play.dto';

@Command({
  name: 'play',
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
