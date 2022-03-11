import { ArgNum, ArgRange } from '@discord-nestjs/core';

export class StartDto {
  @ArgNum(() => ({ position: 0 }))
  gameName: string;

  @ArgRange((last) => ({ formPosition: last + 1 }))
  players: string[];
}
