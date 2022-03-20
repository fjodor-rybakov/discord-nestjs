import { Injectable } from '@nestjs/common';

@Injectable()
export class PlayService {
  play(song: string): string {
    return `Start playing ${song}.`;
  }
}
