import { DiscordClient } from '../discord-client';

export interface DiscordResolve {
  resolve(
    instance: Record<string, any>,
    methodName: string,
    discordClient: DiscordClient
  ): void;
}

