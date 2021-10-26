import { NumberDto } from '../../dto/number.dto';
import { TransformPipe } from '@discord-nestjs/common';
import {
  DiscordTransformedCommand,
  Payload,
  SubCommand,
  UsePipes,
} from '@discord-nestjs/core';

@UsePipes(TransformPipe)
@SubCommand({ name: 'number', description: 'Register by phone number' })
export class NumberSubCommand implements DiscordTransformedCommand<NumberDto> {
  handler(@Payload() dto: NumberDto): string {
    return `Success register user: ${dto.phoneNumber}, ${dto.name}, ${dto.age}, ${dto.city}`;
  }
}
