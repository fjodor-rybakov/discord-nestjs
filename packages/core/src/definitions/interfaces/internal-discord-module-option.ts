import { DiscordModuleOption } from './discord-module-options';

export interface InternalDiscordModuleOption extends DiscordModuleOption {
  /**
   * Use pipes for all handlers
   * Takes list of class types or list of instances
   */
  usePipes?: InstanceType<any>[];

  /**
   * Use guards for all handlers
   * Takes list of class types or list of instances
   */
  useGuards?: InstanceType<any>[];

  /**
   * Use filters for all handlers
   * Takes list of class types or list of instances
   */
  useFilters?: InstanceType<any>[];
}
