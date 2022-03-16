import { randomUUID } from 'crypto';

import { DISCORD_APP_PIPE } from '../../definitions/constants/discord-app-pipe';

export function registerPipeGlobally(): string {
  return `${DISCORD_APP_PIPE}:${randomUUID()}`;
}
