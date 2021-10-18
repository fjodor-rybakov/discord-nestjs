import {
  DiscordTransformedCommand,
  Payload,
  SubCommand,
  UsePipes,
  UseFilters,
} from '@discord-nestjs/core';
import { NumberDto } from './dto/number.dto';
import { TransformPipe, ValidationPipe } from '@discord-nestjs/common';
import { CommandValidationFilter } from './filter/command-validation.filter';

@UseFilters(CommandValidationFilter)
@SubCommand({ name: 'number', description: 'Register by phone number' })
@UsePipes(TransformPipe, ValidationPipe)
export class NumberSubCommand implements DiscordTransformedCommand<NumberDto> {
  handler(@Payload() dto: NumberDto): string {
    console.log('Number dto', dto);
    return 'Success number subcommand';
  }
}
