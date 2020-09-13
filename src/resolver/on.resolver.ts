import { DiscordResolve } from '../interface/discord-resolve';
import { ClientEvents } from 'discord.js';
import { ON_DECORATOR } from '../constant/discord.constant';
import { DiscordClient, OnDecoratorOptions } from '..';
import { DiscordResolveOptions } from '../interface/discord-resolve-options';
import { DiscordMiddlewareInstance } from '../interface/discord-middleware-instance';

export class OnResolver implements DiscordResolve {
  resolve(options: DiscordResolveOptions): void {
    const {discordClient, instance, methodName, middlewareList} = options;
    const metadata: OnDecoratorOptions = Reflect.getMetadata(ON_DECORATOR, instance, methodName);
    if (metadata) {
      discordClient.on(metadata.event, async (...data: ClientEvents[keyof ClientEvents]) => {
        if (!this.isAllowGuild(discordClient, data)) {
          return;
        }
        if (this.isDenyGuild(discordClient, data)) {
          return;
        }
        await this.applyMiddleware(middlewareList, metadata.event, data);
        instance[methodName](...data);
      });
    }
  }

  private async applyMiddleware(
    middlewareList: DiscordMiddlewareInstance[],
    event: keyof ClientEvents,
    context: ClientEvents[keyof ClientEvents]
  ): Promise<void> {
    await Promise.all(middlewareList.map((item: DiscordMiddlewareInstance) => {
      return item.instance.use(event, context);
    }));
  }

  private isAllowGuild(discordClient: DiscordClient, data: any[]): boolean {
    const guild = data.find((item) => !!item && !!item.guild);
    const guildId = !!guild && guild.guild.id;
    if (!!guildId) {
      return discordClient.isAllowGuild(guildId);
    }
    return true;
  }

  private isDenyGuild(discordClient: DiscordClient, data: any[] = []): boolean {
    const guild = data.find((item) => !!item && !!item.guild);
    const guildId = !!guild && guild.guild.id;
    if (!!guildId) {
      return discordClient.isDenyGuild(guildId);
    }
    return false;
  }
}
