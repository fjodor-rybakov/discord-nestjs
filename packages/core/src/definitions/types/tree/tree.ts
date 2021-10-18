import { CommandNode } from './command-node';

export type Tree = {
  [commandName: string]: CommandNode;
};
