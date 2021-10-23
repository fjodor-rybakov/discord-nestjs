import { DiscordExceptionFilter } from '../../decorators/filter/discord-exception-filter';

export interface ResolvedFilterInfo {
  instance: unknown;
  methodName: string;
  exceptionFilters: DiscordExceptionFilter[];
}
