import { DiscordGuard } from '../../decorators/guard/discord-guard';

export interface DiscordGuardList {
  instance: unknown;
  methodName: string;
  guardList: DiscordGuard[];
}
