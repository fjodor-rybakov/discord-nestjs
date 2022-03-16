import { randomUUID } from 'crypto';

import { DISCORD_APP_FILTER } from '../../definitions/constants/discord-app-filter';

export function registerFilterGlobally(): string {
  return `${DISCORD_APP_FILTER}:${randomUUID()}`;
}
