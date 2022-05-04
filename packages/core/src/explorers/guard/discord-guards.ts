import { DiscordGuard } from '../../decorators/guard/discord-guard';

export interface DiscordGuards {
  methodGuards?: {
    [methodName: string]: DiscordGuard[];
  };
  classGuards?: DiscordGuard[];
  globalGuards?: DiscordGuard[];
}
