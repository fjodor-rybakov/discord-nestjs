import { Choice, Param, ParamType } from '@discord-nestjs/core';

import { City } from '../definitions/city';

export class EmailDto {
  @Param({
    name: 'email',
    description: 'Base user email',
    required: true,
  })
  email: string;

  @Param({ description: 'User nickname', required: true })
  name: string;

  @Param({ description: 'User age', required: true, type: ParamType.INTEGER })
  age: number;

  @Choice(City)
  @Param({ description: 'City of residence', type: ParamType.INTEGER })
  city: City;
}
