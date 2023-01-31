import { Choice, Param, ParamType } from '@discord-nestjs/core';

import { City } from '../definitions/city';

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

  @Choice(
    new Map([
      [
        'Moscow',
        {
          value: City.MOSCOW,
          nameLocalizations: { ru: 'Москва' },
        },
      ],
      [
        'New-york',
        { value: City.NEW_YORK, nameLocalizations: { ru: 'Нью-йорк' } },
      ],
      ['Tokyo', { value: City.TOKYO, nameLocalizations: { ru: 'Токио' } }],
    ]),
  )
  @Param({ description: 'City of residence', type: ParamType.INTEGER })
  city: City;
}
