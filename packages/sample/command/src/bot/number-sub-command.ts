import {
  DiscordTransformedCommand,
  Payload,
  SubCommand,
} from '@discord-nestjs/core';
import { NumberDto } from './dto/number.dto';

@SubCommand({ name: 'number', description: 'Register by phone number' })
export class NumberSubCommand implements DiscordTransformedCommand<NumberDto> {
  handler(@Payload() dto: NumberDto): string {
    console.log('Number dto', dto);
    return 'Success number subcommand';
  }
}
