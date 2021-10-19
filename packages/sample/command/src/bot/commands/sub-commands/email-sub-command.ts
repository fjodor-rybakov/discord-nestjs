import { EmailDto } from '../../dto/email.dto';
import { CommandValidationFilter } from '../../filter/command-validation.filter';
import { TransformPipe, ValidationPipe } from '@discord-nestjs/common';
import {
  Payload,
  SubCommand,
  DiscordTransformedCommand,
  UseFilters,
  UsePipes,
} from '@discord-nestjs/core';

@UseFilters(CommandValidationFilter)
@UsePipes(TransformPipe, ValidationPipe)
@SubCommand({ name: 'email', description: 'Register by email' })
export class EmailSubCommand implements DiscordTransformedCommand<EmailDto> {
  handler(@Payload() dto: EmailDto): string {
    return `Success register user: ${dto.email}, ${dto.name}, ${dto.age}, ${dto.city}`;
  }
}
