import { Inject } from '@nestjs/common';

import { INJECT_DISCORD_CLIENT } from './inject-discord-client.constant';

/**
 * Inject Discord.js Client
 */
export function InjectDiscordClient() {
  return Inject(INJECT_DISCORD_CLIENT);
}
