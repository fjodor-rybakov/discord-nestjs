import { SlashCommandPipe } from '@discord-nestjs/common';
import { Handler, IA, SubCommand } from '@discord-nestjs/core';

import { NumberDto } from '../../dto/number.dto';

@SubCommand({ name: 'number', description: 'Register by phone number' })
export class NumberSubCommand {
  @Handler()
  onPhoneNumberCommand(@IA(SlashCommandPipe) dto: NumberDto): string {
    return `Success register user: ${dto.phoneNumber}, ${dto.name}, ${dto.age}, ${dto.city}`;
  }
}
