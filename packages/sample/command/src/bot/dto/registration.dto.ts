import { Arg, Choice } from '@discord-nestjs/core/src';

enum City {
  MOSCOW,
  NEW_YORKl,
  TOKYO,
}

export class RegistrationDto {
  @Arg({ description: '', name: '', required: true })
  name: string;

  @Arg({ description: '', required: true })
  age: number;

  @Choice()
  @Arg({ description: '' })
  city: City;
}
