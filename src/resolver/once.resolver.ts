import { DiscordResolve } from '../interface/discord-resolve';
import { ClientEvents } from "discord.js";
import { DiscordClient } from '../discord-client';
import { OnDecoratorOptions } from '..';
import { ONCE_DECORATOR } from '../constant/discord.constant';

export class OnceResolver implements DiscordResolve {
  resolve<T extends Record<string, (...args: ClientEvents[keyof ClientEvents]) => void>>(
    instance: T,
    methodName: string,
    discordClient: DiscordClient
  ): void {
    const metadata: OnDecoratorOptions = Reflect.getMetadata(ONCE_DECORATOR, instance, methodName);
    if (metadata) {
      discordClient.once(metadata.events, (...data: ClientEvents[keyof ClientEvents]) => {
        instance[methodName](...data);
      });
    }
  }
}
