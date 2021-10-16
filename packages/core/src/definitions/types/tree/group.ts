import { Leaf } from './leaf';

export type Group = Leaf | ({ [subCommand: string]: Group } & Leaf);
