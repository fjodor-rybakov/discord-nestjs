import { Param } from '@discord-nestjs/core';
import { IsAlphanumeric, IsPhoneNumber } from 'class-validator';

export class StatsDto {
  @IsAlphanumeric()
  @Param({
    description: 'Your player name',
    required: true,
    name: 'player-name',
  })
  playerName: string;

  @IsPhoneNumber()
  @Param({
    description: 'Phone number',
    required: true,
    name: 'phone-number',
  })
  phoneNumber: string;
}
