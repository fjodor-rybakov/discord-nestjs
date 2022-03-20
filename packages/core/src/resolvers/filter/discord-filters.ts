import { DiscordExceptionFilter } from '../../decorators/filter/discord-exception-filter';

export interface DiscordFilters {
  methodFilters?: {
    [methodName: string]: DiscordExceptionFilter[];
  };
  classFilters?: DiscordExceptionFilter[];
  globalFilters?: DiscordExceptionFilter[];
}
