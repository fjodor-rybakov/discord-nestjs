import { DiscordResolve } from '../interface/discord-resolve';
import { Message } from 'discord.js';
import { ON_MESSAGE_DECORATOR } from '../constant/discord.constant';
import { DiscordClient, OnCommandDecoratorOptions } from '..';
import { DiscordResolveOptions } from '../interface/discord-resolve-options';

export class OnCommandResolver implements DiscordResolve {
  resolve(options: DiscordResolveOptions): void {
    const {discordClient, instance, methodName} = options;
    const metadata: OnCommandDecoratorOptions = Reflect.getMetadata(ON_MESSAGE_DECORATOR, instance, methodName);
    if (metadata) {
      const {
        name,
        prefix = discordClient.getCommandPrefix(),
        isRemovePrefix = true,
        isIgnoreBotMessage = true,
        isRemoveCommandName = true
      } = metadata;
      discordClient.on('message', (message: Message) => {
        if (!this.isAllowGuild(discordClient, message)) {
          return;
        }
        if (metadata.allowChannel && !metadata.allowChannel.includes(message.channel.id)) {
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

          instance[methodName](message);
        }
      });
    }
  }

  private isAllowGuild(discordClient: DiscordClient, message: Message): boolean {
    const guildId = message.guild && message.guild.id;
    if (guildId) {
      return discordClient.isAllowGuild(guildId);
    }
    return true;
  }

  private getPrefix(messageContent: string, prefix: string): string {
    return messageContent.slice(0, prefix.length);
  }

  private getCommandName(messageContent: string, commandName: string): string {
    return messageContent.slice(0, commandName.length);
  }
}
