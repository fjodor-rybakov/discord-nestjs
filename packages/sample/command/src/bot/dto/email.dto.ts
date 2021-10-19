import { City } from '../definitions/city';
import { Arg, ArgType, Choice } from '@discord-nestjs/core';
import { IsEmail } from 'class-validator';

export class EmailDto {
  @IsEmail()
  @Arg({
    name: 'email',
    description: 'Base user email',
    required: true,
  })
  email: string;

  @Arg({ description: 'User nickname', required: true })
  name: string;

  @Arg({ description: 'User age', required: true, type: ArgType.INTEGER })
  age: number;

  @Choice(City)
  @Arg({ description: 'City of residence', type: ArgType.INTEGER })
  city: City;
}
