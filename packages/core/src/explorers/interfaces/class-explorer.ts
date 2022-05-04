import { ClassExplorerOptions } from './class-explorer-options';

export interface ClassExplorer<TReturn = unknown> {
  explore(
    options: ClassExplorerOptions,
  ): Promise<void | TReturn> | void | TReturn;
}
