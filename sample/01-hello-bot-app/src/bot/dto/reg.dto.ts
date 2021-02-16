import { ArgNum, ArgRange } from 'discord-nestjs';
import { Expose, Type } from 'class-transformer';

export class RegDto {
  @ArgRange(() => ({formPosition: 0, toPosition: 2}))
  @Expose()
  name: string[];

  @ArgNum((last: number) => ({position: last + 1}))
  @Expose()
  @Type(() => Number)
  age: number;
}