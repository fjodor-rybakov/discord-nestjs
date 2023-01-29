import { Choice, CommandOptions, Param, ParamType } from '@discord-nestjs/core';

import { City } from '../definitions/city';

@CommandOptions()
export class EmailDto {
  @Param({
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
