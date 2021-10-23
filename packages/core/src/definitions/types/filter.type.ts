import { DiscordExceptionFilter } from '../../decorators/filter/discord-exception-filter';
import { Type } from '@nestjs/common';

/**
 * Filter type
 */
export type FilterType = DiscordExceptionFilter | Type;
