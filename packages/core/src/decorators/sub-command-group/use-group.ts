import { UseGroupOptions } from './use-group-options';
import { Type } from '@nestjs/common';
import { SubCommandGroupOptions } from './sub-command-group-options';
import { TUseGroup } from '../../definitions/types/use-group.type';

export function UseGroup(
  options: UseGroupOptions,
  ...subCommands: Type[]
): TUseGroup {
  return function useGroup(): SubCommandGroupOptions {
    return { options, subCommands };
  };
}
