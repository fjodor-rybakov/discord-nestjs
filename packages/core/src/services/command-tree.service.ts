import { Injectable } from '@nestjs/common';
import { Tree } from '../definitions/types/tree/tree';
import { Group } from '../definitions/types/tree/group';

@Injectable()
export class CommandTreeService {
  private tree: Tree = {};

  appendNode(path: string[], value: Group): void {
    const cleanPath = path.filter((item) => !!item);
    let index = 0;
    let parent = this.tree;

    while (parent && index < cleanPath.length - 1)
      parent = parent[cleanPath[index++]];

    parent[cleanPath[index]] = value;
  }

  getNode(path: string[]): Group {
    let part = this.tree;

    path
      .filter((name) => !!name)
      .forEach(
        (val, index, commandParts) =>
          part && (part = part[commandParts[index]]),
      );

    return part;
  }

  getTree(): Tree {
    return this.tree;
  }
}
