import { DiscordGuard } from '../../decorator/interface/discord-guard';

export interface DiscordGuardList {
  instance: unknown;
  methodName: string;
  guardList: DiscordGuard[];
}
