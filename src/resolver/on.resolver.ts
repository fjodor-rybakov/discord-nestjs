import { DiscordResolve } from '../interface/discord-resolve';
import { ClientEvents } from 'discord.js';
import { ON_DECORATOR } from '../constant/discord.constant';
import { OnDecoratorOptions } from '..';
import { DiscordClient } from '../discord-client';

export class OnResolver implements DiscordResolve {
  resolve<T extends Record<string, (...args: ClientEvents[keyof ClientEvents]) => void>>(
    instance: T,
    methodName: string,
    discordClient: DiscordClient
  ): void {
    const metadata: OnDecoratorOptions = Reflect.getMetadata(ON_DECORATOR, instance, methodName);
    if (metadata) {
      discordClient.on(metadata.event, (...data: ClientEvents[keyof ClientEvents]) => {
        instance[methodName](...data);
      });
    }
  }
}
