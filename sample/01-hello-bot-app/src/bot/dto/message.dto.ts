import { ArgRange } from 'discord-nestjs';
import { Expose } from 'class-transformer';

export class MessageDto {
  @ArgRange(() => ({ formPosition: 1 }))
  @Expose()
  value: string;
}
