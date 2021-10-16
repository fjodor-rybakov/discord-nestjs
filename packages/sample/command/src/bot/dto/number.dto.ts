import { Arg } from '@discord-nestjs/core';

export class NumberDto {
  @Arg({ name: 'phone-number', description: 'Phone number', required: true })
  phoneNumber: string;
}
