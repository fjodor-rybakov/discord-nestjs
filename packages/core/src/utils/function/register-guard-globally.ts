import { randomUUID } from 'crypto';

import { DISCORD_APP_GUARD } from '../../definitions/constants/discord-app-guard';

export function registerGuardGlobally(): string {
  return `${DISCORD_APP_GUARD}:${randomUUID()}`;
}
