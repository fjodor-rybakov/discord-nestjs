import { Injectable, Type } from '@nestjs/common';
import * as path from 'path';
import { glob } from 'glob';

@Injectable()
export class CommandPathToClassService {
  async resolveCommandsType(commands: (Type | string)[]): Promise<Type[]> {
    if (this.commandsIsStringArray(commands)) {
      const classesList = await Promise.all(
        commands.map(
          (regexPath: string) =>
            new Promise((resolve, reject) =>
              glob(regexPath, async (err, pathToFiles) => {
                if (err) return reject(err);

                return resolve(this.getClasses(pathToFiles));
              }),
            ),
        ),
      );

      return classesList.flat() as Type[];
    }

    return (commands as Type[]) ?? [];
  }

  private commandsIsStringArray(
    commands: Array<Type | string>,
  ): commands is Array<string> {
    return typeof commands[0] === 'string';
  }

  private getClasses(pathToFiles: string[]): Promise<Type[]> {
    return Promise.all(
      pathToFiles.map(async (pathToFile: string) => {
        const resolvedPath = path.resolve(process.cwd(), pathToFile);
        const commandClass = await import(resolvedPath);

        return Object.values<Type>(commandClass)[0];
      }),
    );
  }
}
