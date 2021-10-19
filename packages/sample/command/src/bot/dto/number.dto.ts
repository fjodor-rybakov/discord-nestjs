import { City } from '../definitions/city';
import { Arg, ArgType, Choice } from '@discord-nestjs/core';
import { IsPhoneNumber } from 'class-validator';

export class NumberDto {
  @IsPhoneNumber()
  @Arg({
    name: 'phone-number',
    description: 'Phone number',
    required: true,
  })
  phoneNumber: string;

  @Arg({ description: 'User nickname', required: true })
  name: string;

  @Arg({ description: 'User age', required: true, type: ArgType.INTEGER })
  age: number;

  @Choice(City)
  @Arg({ description: 'City of residence', type: ArgType.INTEGER })
  city: City;
}
