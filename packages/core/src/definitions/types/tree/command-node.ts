import { Leaf } from './leaf';

export type CommandNode = Leaf | ({ [subCommand: string]: CommandNode } & Leaf);
