import { Injectable } from '@nestjs/common';

@Injectable()
export class PlayService {
  play(song: string) {
    return `Start playing ${song}.`;
  }
}
