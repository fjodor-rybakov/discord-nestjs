import { DiscordResolve } from '../interface/discord-resolve';
import { Client, ClientEvents } from 'discord.js';
import { ON_DECORATOR } from '../constant/discord.constant';
import { OnDecoratorOptions } from '../decorator/interface/on-decorator-options';

export class OnResolver implements DiscordResolve {
  resolve<T extends Record<string, (...args: ClientEvents[keyof ClientEvents]) => void>>(
    instance: T,
    methodName: string,
    discordClient: Client
  ): void {
    const metadata: OnDecoratorOptions = Reflect.getMetadata(ON_DECORATOR, instance, methodName);
    if (metadata) {
      discordClient.on(metadata.events, (...data: ClientEvents[keyof ClientEvents]) => {
        instance[methodName](...data);
      });
    }
  }
}
