import { TransformPipe, ValidationPipe } from '@discord-nestjs/common';
import {
  Command,
  DiscordTransformedCommand,
  Payload,
  UseFilters,
  UsePipes,
} from '@discord-nestjs/core';

import { StatsDto } from '../dto/stats.dto';
import { CommandValidationFilter } from '../filter/command-validation.filter';

@Command({
  name: 'player-stats',
  description: 'Get user stats',
})
@UsePipes(TransformPipe, ValidationPipe)
@UseFilters(CommandValidationFilter)
export class StatsCommand implements DiscordTransformedCommand<StatsDto> {
  handler(@Payload() dto: StatsDto): string {
    return 'Player stats...';
  }
}
