import { MethodExplorerOptions } from './method-explorer-options';

export interface MethodExplorer {
  explore(options: MethodExplorerOptions): Promise<void> | void;
}
