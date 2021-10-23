import { NumberDto } from '../../dto/number.dto';
import { CommandValidationFilter } from '../../filter/command-validation.filter';
import { TransformPipe, ValidationPipe } from '@discord-nestjs/common';
import {
  DiscordTransformedCommand,
  Payload,
  SubCommand,
  UsePipes,
  UseFilters,
} from '@discord-nestjs/core';

@UseFilters(CommandValidationFilter)
@UsePipes(TransformPipe, ValidationPipe)
@SubCommand({ name: 'number', description: 'Register by phone number' })
export class NumberSubCommand implements DiscordTransformedCommand<NumberDto> {
  handler(@Payload() dto: NumberDto): string {
    return `Success register user: ${dto.phoneNumber}, ${dto.name}, ${dto.age}, ${dto.city}`;
  }
}
