import { Choice, CommandOption, Param, ParamType } from '@discord-nestjs/core';

import { City } from '../definitions/city';

@CommandOption()
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
