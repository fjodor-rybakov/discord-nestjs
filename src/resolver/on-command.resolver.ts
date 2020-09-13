import { DiscordResolve } from '../interface/discord-resolve';
import { ClientEvents, Message } from 'discord.js';
import { ON_MESSAGE_DECORATOR } from '../constant/discord.constant';
import { DiscordClient, OnCommandDecoratorOptions } from '..';
import { DiscordResolveOptions } from '../interface/discord-resolve-options';
import { DiscordMiddlewareInstance } from '../interface/discord-middleware-instance';

export class OnCommandResolver implements DiscordResolve {
  resolve(options: DiscordResolveOptions): void {
    const {discordClient, instance, methodName, middlewareList} = options;
    const metadata: OnCommandDecoratorOptions = Reflect.getMetadata(ON_MESSAGE_DECORATOR, instance, methodName);
    if (metadata) {
      const {
        name,
        prefix = discordClient.getCommandPrefix(),
        isRemovePrefix = true,
        isIgnoreBotMessage = true,
        isRemoveCommandName = true
      } = metadata;
      discordClient.on('message', async (message: Message) => {
        if (!this.isAllowGuild(discordClient, message)) {
          return;
        }
        if (this.isDenyGuild(discordClient, message)) {
          return;
        }
        if (metadata.allowChannels && !metadata.allowChannels.includes(message.channel.id)) {
          return;
        }
        const messageContent = message.content;
        const messagePrefix = this.getPrefix(messageContent, prefix);
        const commandName = this.getCommandName(messageContent.slice(messagePrefix.length), name);

        if (messagePrefix === prefix && commandName === name) {
          if (isRemovePrefix) {
            message.content = messageContent.slice(prefix.length);
          }

          if (isRemoveCommandName) {
            if (isRemovePrefix) {
              message.content = messageContent.slice(prefix.length + commandName.length);
            } else {
              message.content = messageContent.substring(0, prefix.length) + messageContent.substring(prefix.length + commandName.length);
            }
          }

          if (isIgnoreBotMessage && message.author.bot) {
            return;
          }
          message.content = message.content.trim();
          await this.applyMiddleware(middlewareList, 'message', [message]);
          instance[methodName](message);
        }
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

  private isAllowGuild(discordClient: DiscordClient, message: Message): boolean {
    const guildId = message.guild && message.guild.id;
    if (!!guildId) {
      return discordClient.isAllowGuild(guildId);
    }
    return true;
  }

  private isDenyGuild(discordClient: DiscordClient, message: Message): boolean {
    const guildId = message.guild && message.guild.id;
    if (!!guildId) {
      return discordClient.isDenyGuild(guildId);
    }
    return false;
  }

  private getPrefix(messageContent: string, prefix: string): string {
    return messageContent.slice(0, prefix.length);
  }

  private getCommandName(messageContent: string, commandName: string): string {
    return messageContent.slice(0, commandName.length);
  }
}
