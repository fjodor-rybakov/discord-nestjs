import { SlashCommandPipe, ValidationPipe } from '@discord-nestjs/common';
import { Command, Handler, IA } from '@discord-nestjs/core';
import { UseFilters } from '@nestjs/common';

import { StatsDto } from '../dto/stats.dto';
import { CommandValidationFilter } from '../filter/command-validation.filter';

@Command({
  name: 'player-stats',
  description: 'Get user stats',
})
export class StatsCommand {
  @Handler()
  @UseFilters(CommandValidationFilter)
  onStatusCommand(@IA(SlashCommandPipe, ValidationPipe) dto: StatsDto): string {
    return 'Player stats...';
  }
}
