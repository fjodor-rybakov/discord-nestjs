import { DISCORD_APP_FILTER } from '../../definitions/constants/discord-app-filter';

/**
 * Register global exception filter
 *
 * @param priority - execution priority(default 0)
 */
export function registerFilterGlobally(priority = 0): string {
  return `${DISCORD_APP_FILTER}:${priority}`;
}
