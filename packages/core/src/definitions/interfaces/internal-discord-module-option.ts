import { DiscordExceptionFilter } from '../../decorators/filter/discord-exception-filter';
import { DiscordGuard } from '../../decorators/guard/discord-guard';
import { DiscordPipeTransform } from '../../decorators/pipe/discord-pipe-transform';
import { DiscordModuleOption } from './discord-module-options';

export interface InternalDiscordModuleOption extends DiscordModuleOption {
  /**
   * Use pipes for all handlers
   * Takes list of class types or list of instances
   */
  usePipes?: DiscordPipeTransform[];

  /**
   * Use guards for all handlers
   * Takes list of class types or list of instances
   */
  useGuards?: DiscordGuard[];

  /**
   * Use filters for all handlers
   * Takes list of class types or list of instances
   */
  useFilters?: DiscordExceptionFilter[];
}
