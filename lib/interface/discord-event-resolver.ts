import { DiscordResolveOptions } from './discord-resolve-options';

export interface DiscordEventResolver {
  resolve(options: DiscordResolveOptions): void;
}
