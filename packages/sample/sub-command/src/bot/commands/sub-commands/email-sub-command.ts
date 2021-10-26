import { EmailDto } from '../../dto/email.dto';
import { TransformPipe } from '@discord-nestjs/common';
import {
  Payload,
  SubCommand,
  DiscordTransformedCommand,
  UsePipes,
} from '@discord-nestjs/core';

@UsePipes(TransformPipe)
@SubCommand({ name: 'email', description: 'Register by email' })
export class EmailSubCommand implements DiscordTransformedCommand<EmailDto> {
  handler(@Payload() dto: EmailDto): string {
    return `Success register user: ${dto.email}, ${dto.name}, ${dto.age}, ${dto.city}`;
  }
}
