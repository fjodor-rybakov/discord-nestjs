import { DiscordPipeTransform } from '../../decorators/pipe/discord-pipe-transform';

export interface DiscordPipes {
  methodPipes?: {
    [methodName: string]: DiscordPipeTransform[];
  };
  classPipes?: DiscordPipeTransform[];
  globalPipes?: DiscordPipeTransform[];
}
