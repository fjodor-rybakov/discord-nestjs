import { ArgNum } from 'discord-nestjs';
import { Expose } from 'class-transformer';

export class DelDto {
  @ArgNum(() => ({position: 0}))
  @Expose()
  id: string;
}