import { Payload, SubCommand } from '@discord-nestjs/core';
import { DiscordTransformedCommand } from '@discord-nestjs/core/src';
import { EmailDto } from './dto/email.dto';

@SubCommand({ name: 'email', description: 'Register by email' })
export class EmailSubCommand implements DiscordTransformedCommand<EmailDto> {
  handler(@Payload() dto: EmailDto): string {
    console.log('Email dto', dto);
    return 'Success email subcommand';
  }
}
