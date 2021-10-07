import { Arg } from '@discord-nestjs/core';

export class EmailDto {
  @Arg({ name: 'email', description: 'Base user email', required: true })
  email: string;
}
