import { ArgNum, ArgRange } from 'discord-nestjs';
import { Expose, Type } from 'class-transformer';
import { IsArray, MaxLength, Min } from 'class-validator';

export class RegDto {
  @ArgRange(() => ({ formPosition: 1, toPosition: 4 }))
  @Expose()
  @IsArray()
  @MaxLength(20, { each: true })
  name: string[];

  @ArgNum((last: number) => ({ position: last }))
  @Expose()
  @Type(() => Number)
  @Min(18)
  age: number;
}
