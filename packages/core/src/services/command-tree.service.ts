import { Injectable } from '@nestjs/common';

@Injectable()
export class CommandTreeService {
  private tree: Record<string, any> = {};

  appendNode(path: string[], value: any): void {
    const cleanPath = path.filter((item) => !!item);
    let index = 0;
    let parent = this.tree;

    while (parent && index < cleanPath.length - 1)
      parent = parent[cleanPath[index++]];

    parent[cleanPath[index]] = value;
  }

  getNode(path: string[]): any {
    let part = this.tree;

    path
      .filter((name) => !!name)
      .forEach(
        (val, index, commandParts) =>
          part && (part = part[commandParts[index]]),
      );

    return part;
  }
}
