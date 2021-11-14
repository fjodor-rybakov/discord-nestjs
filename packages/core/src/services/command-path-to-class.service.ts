import { Injectable, Type } from '@nestjs/common';
import { glob } from 'glob';
import * as path from 'path';

import { COMMAND_DECORATOR } from '../decorators/command/command.constant';

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

                const types = (await this.getClasses(pathToFiles)).flat();

                return resolve(
                  types.filter((type) =>
                    Reflect.hasOwnMetadata(COMMAND_DECORATOR, type.prototype),
                  ),
                );
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

  private getClasses(pathToFiles: string[]): Promise<Type[][]> {
    return Promise.all(
      pathToFiles.map(async (pathToFile: string) => {
        const resolvedPath = path.resolve(process.cwd(), pathToFile);
        const commandClass = await import(resolvedPath);

        return Object.values<Type>(commandClass);
      }),
    );
  }
}
