import { SubCommandGroupOptions } from './sub-command-group-options';

export function isSubCommandGroup(
  item: any,
): item is () => SubCommandGroupOptions {
  return item.name === 'useGroup';
}
