import { Type } from '@nestjs/common';

import { DiscordExceptionFilter } from '../../decorators/filter/discord-exception-filter';

/**
 * Filter type
 */
export type FilterType = DiscordExceptionFilter | Type;
