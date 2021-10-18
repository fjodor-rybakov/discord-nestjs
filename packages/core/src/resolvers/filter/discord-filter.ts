import { DiscordExceptionFilter } from '../../decorators/filter/discord-exception-filter';

export interface DiscordFilter {
  instance: unknown;
  methodName: string;
  exceptionFilters: DiscordExceptionFilter[];
}
