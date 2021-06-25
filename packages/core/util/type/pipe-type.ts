import { DiscordPipeTransform } from '../../decorator/interface/discord-pipe-transform';
import { Type } from '@nestjs/common';

/**
 * Pipe type
 */
export type PipeType = DiscordPipeTransform | Type;
