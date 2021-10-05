import { Type } from '@nestjs/common';
import { DiscordPipeTransform } from '../../decorators/pipe/discord-pipe-transform';

/**
 * Pipe type
 */
export type PipeType = DiscordPipeTransform | Type;
