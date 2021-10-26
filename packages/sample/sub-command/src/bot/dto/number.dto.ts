import { City } from '../definitions/city';
import { Param, ParamType, Choice } from '@discord-nestjs/core';

export class NumberDto {
  @Param({
    name: 'phone-number',
    description: 'Phone number',
    required: true,
  })
  phoneNumber: string;

  @Param({ description: 'User nickname', required: true })
  name: string;

  @Param({ description: 'User age', required: true, type: ParamType.INTEGER })
  age: number;

  @Choice(City)
  @Param({ description: 'City of residence', type: ParamType.INTEGER })
  city: City;
}
