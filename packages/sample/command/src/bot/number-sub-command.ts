import { NumberDto } from './dto/number.dto';
import { CommandValidationFilter } from './filter/command-validation.filter';
import { TransformPipe, ValidationPipe } from '@discord-nestjs/common';
import {
  DiscordTransformedCommand,
  Payload,
  SubCommand,
  UsePipes,
  UseFilters,
} from '@discord-nestjs/core';

@UseFilters(CommandValidationFilter)
@SubCommand({ name: 'number', description: 'Register by phone number' })
@UsePipes(TransformPipe, ValidationPipe)
export class NumberSubCommand implements DiscordTransformedCommand<NumberDto> {
  handler(@Payload() dto: NumberDto): string {
    console.log('Number dto', dto);
    return 'Success number subcommand';
  }
}
