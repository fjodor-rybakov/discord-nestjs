import { StatsDto } from '../dto/stats.dto';
import { CommandValidationFilter } from '../filter/command-validation.filter';
import { TransformPipe, ValidationPipe } from '@discord-nestjs/common';
import {
  Command,
  DiscordTransformedCommand,
  Payload,
  UsePipes,
  UseFilters,
} from '@discord-nestjs/core';

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
