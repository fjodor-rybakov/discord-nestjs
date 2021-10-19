import { DiscordGuard } from '../../decorators/guard/discord-guard';

export interface ResolvedGuardInfo {
  instance: unknown;
  methodName: string;
  guardList: DiscordGuard[];
}
