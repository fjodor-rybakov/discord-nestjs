import { ArgNum, TransformToUser } from 'discord-nestjs';
import { Expose } from 'class-transformer';
import { User } from 'discord.js';
import { IsDefined } from 'class-validator';

export class DelDto {
  @TransformToUser()
  @ArgNum(() => ({position: 1}))
  @IsDefined()
  @Expose()
  user: User;
}