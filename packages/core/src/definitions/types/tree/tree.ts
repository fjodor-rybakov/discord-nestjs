import { Group } from './group';

export type Tree = {
  [commandName: string]: Group;
};
