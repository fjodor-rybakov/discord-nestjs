import { Arg } from '@discord-nestjs/core';

export class NumberDto {
  @Arg({ name: 'number', description: 'Phone number', required: true })
  number: string;
}
