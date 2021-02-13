import { DiscordPipeTransform } from '../../decorator/interface/discord-pipe-transform';

export interface DiscordPipeList {
  instance: unknown;
  methodName: string;
  pipeList: DiscordPipeTransform[];
}