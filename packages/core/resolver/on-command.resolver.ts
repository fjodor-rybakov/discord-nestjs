import { Injectable, Logger } from '@nestjs/common';
import { ClientEvents, Message } from 'discord.js';
import { DiscordService } from '../service/discord.service';
import { ReflectMetadataProvider } from '../provider/reflect-metadata.provider';
import { GuardResolver } from './guard.resolver';
import { DiscordHandlerService } from '../service/discord-handler.service';
import { DiscordAccessService } from '../service/discord-access.service';
import { MethodResolveOptions } from './interface/method-resolve-options';
import { MiddlewareResolver } from './middleware.resolver';
import { PipeResolver } from './pipe.resolver';
import { ParamResolver } from './param.resolver';
import { MethodResolver } from './interface/method-resolver';
import { DiscordCatchService } from '../service/discord-catch.service';
import { DiscordModuleCommandOptions } from '../interface/discord-module-command-options';
import { OnCommandDecoratorOptions } from '../decorator/interface/on-command-decorator-options';

@Injectable()
export class OnCommandResolver implements MethodResolver {
  private readonly logger = new Logger();

  constructor(
    private readonly guardResolver: GuardResolver,
    private readonly metadataProvider: ReflectMetadataProvider,
    private readonly discordService: DiscordService,
    private readonly discordHandlerService: DiscordHandlerService,
    private readonly discordAccessService: DiscordAccessService,
    private readonly middlewareResolver: MiddlewareResolver,
    private readonly pipeResolver: PipeResolver,
    private readonly paramResolver: ParamResolver,
    private readonly discordCatchService: DiscordCatchService,
  ) {}

  resolve(options: MethodResolveOptions): void {
    const { instance, methodName } = options;
    const metadata = this.metadataProvider.getOnCommandDecoratorMetadata(instance, methodName);
    if (!metadata) {
      return;
    }
    this.logger.setContext(instance.constructor.name);
    const {
      name,
      prefix = this.discordService.getCommandPrefix(),
      isRemovePrefix = true,
      isIgnoreBotMessage = true,
      isRemoveCommandName = true,
      isRemoveMessage = false
    } = metadata;
    this.logger.log(`Initialize command: ${name}`);
    this.discordService.getClient().on('message', async (message: Message) => {
      //#region check allow handle message
      if (isIgnoreBotMessage && message.author.bot) {
        return;
      }
      if (!this.discordAccessService.isAllowMessageGuild(message)) {
        return;
      }
      if (this.discordAccessService.isDenyMessageGuild(message)) {
        return;
      }
      //#endregion

      let messageContent = message.content.trim();
      const messagePrefix = this.getPrefix(messageContent, prefix);
      const commandName = this.getCommandName(
        messageContent,
        messagePrefix.length,
      );
      if (messagePrefix !== prefix || commandName !== name) {
        return; // not suitable for handler
      }
      const commandOptions = this.getCommandOptions(metadata);
      if (!this.discordAccessService.isAllowCommand(commandName, message, commandOptions)) {
        return;
      }

      ///#region handle message
      if (isRemovePrefix) {
        messageContent = messageContent.slice(prefix.length);
      }
      if (isRemoveCommandName) {
        if (isRemovePrefix) {
          messageContent = messageContent.slice(
            prefix.length + commandName.length,
          );
        } else {
          messageContent =
            messageContent.substring(0, prefix.length) +
            messageContent.substring(prefix.length + commandName.length);
        }
      }
      messageContent = messageContent.trim();
      //#endregion

      //#region apply middleware, guard, pipe
      const eventName = 'message';
      const context: ClientEvents['message'] = [message];
      await this.middlewareResolver.applyMiddleware(eventName, context);
      const isAllowFromGuards = await this.guardResolver.applyGuard({
        instance,
        methodName,
        event: eventName,
        context
      });
      if (!isAllowFromGuards) {
        return;
      }
      const paramType = this.paramResolver.getContentType({
        instance,
        methodName,
      });
      let pipeMessageContent;
      try {
        pipeMessageContent = await this.pipeResolver.applyPipe({
          instance,
          methodName,
          event: eventName,
          context,
          content: message.content,
          type: paramType
        });
        messageContent = pipeMessageContent ?? messageContent;
      } catch (err) {
        await this.discordCatchService.pipeExceptionFactory(err, message);
        return;
      }
      //#endregion

      const argsFromDecorator = this.paramResolver.applyParam({
        instance,
        methodName,
        context,
        content: messageContent
      });
      const handlerArgs = argsFromDecorator ?? context;
      await this.discordHandlerService.callHandler(
        instance,
        methodName,
        handlerArgs
      );
      if (isRemoveMessage) {
        await this.removeMessageFromChannel(message);
      }
    });
  }

  private getPrefix(messageContent: string, prefix: string): string {
    return messageContent.slice(0, prefix.length);
  }

  private getCommandName(messageContent: string, prefixLength: number): string {
    const messageParts = messageContent.split(' ')[0];
    return messageContent.slice(prefixLength, messageParts.length);
  }

  private async removeMessageFromChannel(message: Message): Promise<void> {
    await message.delete();
  }

  private getCommandOptions(metadata: OnCommandDecoratorOptions): DiscordModuleCommandOptions {
    const {allowChannels, allowUsers, channelType, name} = metadata
    let globalCommandOptions = this.discordService.getAllowCommands();
    let commandOptions = globalCommandOptions
      .find((options: DiscordModuleCommandOptions) => options.name === name);
    if (allowChannels || allowUsers || channelType) {
      const sourceObject: DiscordModuleCommandOptions = { name };
      if (allowChannels) {
        sourceObject.channels = allowChannels;
      }
      if (allowUsers) {
        sourceObject.users = allowUsers;
      }
      if (channelType) {
        sourceObject.channelType = channelType;
      }
      if (commandOptions) {
        return Object.assign(commandOptions, sourceObject);
      }
      return sourceObject;
    }
    return commandOptions;
  }
}
