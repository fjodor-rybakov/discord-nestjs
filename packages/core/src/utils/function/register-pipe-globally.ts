import { DISCORD_APP_PIPE } from '../../definitions/constants/discord-app-pipe';

/**
 * Register global pipe
 *
 * @param priority - execution priority(default 0)
 */
export function registerPipeGlobally(priority = 0): string {
  return `${DISCORD_APP_PIPE}:${priority}`;
}
