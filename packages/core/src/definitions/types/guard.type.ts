import { Type } from '@nestjs/common';

import { DiscordGuard } from '../../decorators/guard/discord-guard';

/**
 * Guard type
 */
export type GuardType = DiscordGuard | Type;
