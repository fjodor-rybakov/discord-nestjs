import { Arg, Choice, ArgType } from '@discord-nestjs/core';

enum City {
  Moscow,
  'New York',
  Tokyo,
}

export class BaseInfoDto {
  @Arg({ description: 'User name', required: true })
  name: string;

  @Arg({ description: 'User old', required: true, type: ArgType.INTEGER })
  age: number;

  @Choice(City)
  @Arg({ description: 'User city', type: ArgType.INTEGER })
  city: City;
}
