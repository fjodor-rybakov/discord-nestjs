import { DISCORD_APP_GUARD } from '../../definitions/constants/discord-app-guard';

/**
 * Register global guard
 *
 * @param priority - execution priority(default 0)
 */
export function registerGuardGlobally(priority = 0): string {
  return `${DISCORD_APP_GUARD}:${priority}`;
}
