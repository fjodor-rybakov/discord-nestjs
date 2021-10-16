import {
  DiscordTransformedCommand,
  Payload,
  SubCommand,
  UsePipes,
} from '@discord-nestjs/core';
import { NumberDto } from './dto/number.dto';
import { TransformPipe } from '@discord-nestjs/common';

@SubCommand({ name: 'number', description: 'Register by phone number' })
@UsePipes(TransformPipe)
export class NumberSubCommand implements DiscordTransformedCommand<NumberDto> {
  handler(@Payload() dto: NumberDto): string {
    console.log('Number dto', dto);
    return 'Success number subcommand';
  }
}
