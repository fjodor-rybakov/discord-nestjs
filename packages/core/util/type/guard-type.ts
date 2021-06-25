import { DiscordGuard } from '../../decorator/interface/discord-guard';
import { Type } from '@nestjs/common';

/**
 * Guard type
 */
export type GuardType = DiscordGuard | Type;
