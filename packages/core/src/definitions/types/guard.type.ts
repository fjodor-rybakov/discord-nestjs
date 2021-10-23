import { DiscordGuard } from '../../decorators/guard/discord-guard';
import { Type } from '@nestjs/common';

/**
 * Guard type
 */
export type GuardType = DiscordGuard | Type;
