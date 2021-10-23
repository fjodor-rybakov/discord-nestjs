import { TUseGroup } from '../../definitions/types/use-group.type';
import { SubCommandGroupOptions } from './sub-command-group-options';
import { UseGroupOptions } from './use-group-options';
import { Type } from '@nestjs/common';

/**
 * Combines sub commands into a group
 */
export function UseGroup(
  options: UseGroupOptions,
  ...subCommands: Type[]
): TUseGroup {
  return function useGroup(): SubCommandGroupOptions {
    return { options, subCommands };
  };
}
