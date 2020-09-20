import { DiscordClient } from '../discord-client';
import { DiscordMiddlewareInstance } from './discord-middleware-instance';

export interface DiscordResolveOptions {
  instance: Record<string, any>;
  methodName: string;
  discordClient: DiscordClient;
  middlewareList: DiscordMiddlewareInstance[];
}
