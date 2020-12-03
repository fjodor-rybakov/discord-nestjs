import { DiscordResolve } from '../interface/discord-resolve';
import { Message } from 'discord.js';
import { ON_MESSAGE_DECORATOR } from '../constant/discord.constant';
import {
  DiscordClient,
  DiscordModuleChannelOptions,
  OnCommandDecoratorOptions,
} from '..';
import { DiscordResolveOptions } from '../interface/discord-resolve-options';
import { DiscordMiddlewareService } from '../service/discord-middleware.service';
import { Injectable } from '@nestjs/common';
import { DiscordPipeService } from '../service/discord-pipe.service';
import { DiscordGuardService } from '../service/discord-guard.service';
import { DiscordResolverHelper } from '../helper/discord-resolver.helper';

@Injectable()
export class OnCommandResolver implements DiscordResolve {
  constructor(
    private readonly discordMiddlewareService: DiscordMiddlewareService,
    private readonly discordPipeService: DiscordPipeService,
    private readonly discordGuardService: DiscordGuardService,
    private readonly discordResolverHelper: DiscordResolverHelper,
  ) {}

  resolve(options: DiscordResolveOptions): void {
    const { discordClient, instance, methodName, middlewareList } = options;
    const metadata = this.getDecoratorMetadata(instance, methodName);
    const pipes = this.discordResolverHelper.getPipeMetadata(
      instance,
      methodName,
    );
    const guards = this.discordResolverHelper.getGuardMetadata(
      instance,
      methodName,
    );
    if (metadata) {
      const {
        name,
        prefix = discordClient.getCommandPrefix(),
        isRemovePrefix = true,
        isIgnoreBotMessage = true,
        isRemoveCommandName = true,
        isRemoveMessage = false,
      } = metadata;
      discordClient.on('message', async (message: Message) => {
        if (!this.isAllowGuild(discordClient, message)) {
          return;
        }
        if (this.isDenyGuild(discordClient, message)) {
          return;
        }
        if (isIgnoreBotMessage && message.author.bot) {
          return;
        }
        if (
          (metadata.allowChannels &&
            !metadata.allowChannels.includes(message.channel.id)) ||
          !this.isAllowChannel(discordClient, name, message.channel.id)
        ) {
          return;
        }
        const messageContent = message.content.trim();
        const messagePrefix = this.getPrefix(messageContent, prefix);
        const commandName = this.getCommandName(
          messageContent.slice(messagePrefix.length),
          name,
        );

        if (messagePrefix === prefix && commandName === name) {
          if (guards && guards.length !== 0) {
            const isAllowFromGuards = await this.discordGuardService.applyGuards(
              guards,
              'message',
              message,
            );
            if (!isAllowFromGuards) {
              return;
            }
          }
          if (isRemovePrefix) {
            message.content = messageContent.slice(prefix.length);
          }

          if (isRemoveCommandName) {
            if (isRemovePrefix) {
              message.content = messageContent.slice(
                prefix.length + commandName.length,
              );
            } else {
              message.content =
                messageContent.substring(0, prefix.length) +
                messageContent.substring(prefix.length + commandName.length);
            }
          }

          message.content = message.content.trim();
          await this.discordMiddlewareService.applyMiddleware(
            middlewareList,
            'message',
            [message],
          );
          if (pipes && pipes.length !== 0) {
            message = await this.discordPipeService.applyPipes(
              pipes,
              'message',
              message,
            );
          }
          this.discordResolverHelper.callHandler(
            instance,
            methodName,
            [message],
            'message',
          );
          if (isRemoveMessage) {
            await this.removeMessageFromChannel(message);
          }
        }
      });
    }
  }

  private isAllowChannel(
    discordClient: DiscordClient,
    eventName: string,
    channelId: string,
  ): boolean {
    const allowChannels = discordClient.getAllowChannels();
    if (allowChannels.length !== 0) {
      return allowChannels.some((item: DiscordModuleChannelOptions) => {
        if (item.commandName === eventName) {
          return item.channels.includes(channelId);
        }
        return true;
      });
    }
    return true;
  }

  private isAllowGuild(
    discordClient: DiscordClient,
    message: Message,
  ): boolean {
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

  private async removeMessageFromChannel(message: Message): Promise<void> {
    await message.delete();
  }

  private getDecoratorMetadata(
    instance: any,
    methodName: string,
  ): OnCommandDecoratorOptions {
    return Reflect.getMetadata(ON_MESSAGE_DECORATOR, instance, methodName);
  }
}
