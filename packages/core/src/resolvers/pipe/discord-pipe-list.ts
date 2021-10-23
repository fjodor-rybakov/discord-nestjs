import { DiscordPipeTransform } from '../../decorators/pipe/discord-pipe-transform';

export interface DiscordPipeList {
  instance: unknown;
  methodName: string;
  pipeList: DiscordPipeTransform[];
}
