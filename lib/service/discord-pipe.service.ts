import { DiscordPipeTransform } from '..';
import { ClientEvents, Message } from 'discord.js';
import { Injectable } from '@nestjs/common';
import { ConstructorType } from '../utils/type/constructor-type';

@Injectable()
export class DiscordPipeService {
  applyPipes(
    pipes: (DiscordPipeTransform | ConstructorType)[],
    event: keyof ClientEvents,
    context: any,
  ): Promise<any> {
    return pipes.reduce(
      async (
        prev: Promise<Message>,
        curr: DiscordPipeTransform | ConstructorType,
      ) => {
        let pipesInstance: DiscordPipeTransform;
        if (typeof curr === 'function') {
          pipesInstance = new curr();
        }
        const prevData = await prev;
        return pipesInstance.transform(event, prevData);
      },
      context,
    );
  }
}
