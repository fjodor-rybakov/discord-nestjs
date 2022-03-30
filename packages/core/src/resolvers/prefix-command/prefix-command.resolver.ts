import { Injectable, Logger } from '@nestjs/common';
import { ClientEvents, Message } from 'discord.js';

import { ExecutionContext } from '../../definitions/interfaces/execution-context';
import { ReflectMetadataProvider } from '../../providers/reflect-metadata.provider';
import { DiscordClientService } from '../../services/discord-client.service';
import { DiscordOptionService } from '../../services/discord-option.service';
import { DtoService } from '../../services/dto.service';
import { CollectorResolver } from '../collector/collector.resolver';
import { FilterResolver } from '../filter/filter.resolver';
import { GuardResolver } from '../guard/guard.resolver';
import { MethodResolveOptions } from '../interfaces/method-resolve-options';
import { MethodResolver } from '../interfaces/method-resolver';
import { MiddlewareResolver } from '../middleware/middleware.resolver';
import { PipeResolver } from '../pipe/pipe.resolver';

@Injectable()
export class PrefixCommandResolver implements MethodResolver {
  private readonly logger = new Logger();

  constructor(
    private readonly metadataProvider: ReflectMetadataProvider,
    private readonly discordClientService: DiscordClientService,
    private readonly discordOptionService: DiscordOptionService,
    private readonly middlewareResolver: MiddlewareResolver,
    private readonly guardResolver: GuardResolver,
    private readonly filterResolver: FilterResolver,
    private readonly pipeResolver: PipeResolver,
    private readonly collectorResolver: CollectorResolver,
    private readonly dtoService: DtoService,
  ) {}

  async resolve({ instance, methodName }: MethodResolveOptions): Promise<void> {
    const metadata = this.metadataProvider.getOnCommandDecoratorMetadata(
      instance,
      methodName,
    );

    if (!metadata) return;

    const discordOptions = this.discordOptionService.getClientData();
    const { prefixGlobalOptions } = discordOptions;

    const {
      name,
      prefix = discordOptions.prefix,
      isRemovePrefix = prefixGlobalOptions.isRemovePrefix ?? true,
      isIgnoreBotMessage = prefixGlobalOptions.isIgnoreBotMessage ?? true,
      isRemoveCommandName = prefixGlobalOptions.isRemoveCommandName ?? true,
      isRemoveMessage = prefixGlobalOptions.isRemoveMessage ?? false,
    } = metadata;

    if (!prefix) throw new Error(`Prefix for ${name} command not found`);

    this.logger.log(
      `Create "${name}" command with prefix "${prefix}"`,
      instance.constructor.name,
    );

    const dtoInstance = await this.dtoService.createDtoInstance(
      instance,
      methodName,
    );

    const event: keyof ClientEvents = 'messageCreate';

    this.discordClientService
      .getClient()
      .on(event, async (message: Message) => {
        const eventArgs: [message: Message] = [message];

        try {
          if (isIgnoreBotMessage && message.author.bot) return;

          let messageContent = message.content.trim();
          const messagePrefix = this.getPrefix(messageContent, prefix);
          const commandName = this.getCommandName(
            messageContent,
            messagePrefix.length,
          );
          if (messagePrefix !== prefix || commandName !== name) return; // not suitable for handler

          //#region handle message
          if (isRemovePrefix)
            messageContent = messageContent.slice(prefix.length);

          if (isRemoveCommandName)
            messageContent = isRemovePrefix
              ? messageContent.slice(prefix.length + commandName.length)
              : messageContent.substring(0, prefix.length) +
                messageContent.substring(prefix.length + commandName.length);

          message.content = messageContent.trim();
          //#endregion

          //#region apply middleware, guard, pipe
          await this.middlewareResolver.applyMiddleware(event, eventArgs);
          const isAllowFromGuards = await this.guardResolver.applyGuard({
            instance,
            methodName,
            event,
            eventArgs,
          });
          if (!isAllowFromGuards) return;

          const pipeResult = await this.pipeResolver.applyPipe({
            instance,
            methodName,
            event,
            metatype: dtoInstance?.constructor,
            eventArgs,
            initValue: message,
            commandNode: { dtoInstance },
          });
          //#endregion

          const collectors = await this.collectorResolver.applyCollector({
            instance,
            methodName,
            event,
            eventArgs,
          });

          const executionContext: ExecutionContext = {
            collectors,
          };
          const handlerArgs = dtoInstance ? [pipeResult, message] : eventArgs;

          const replyResult = await instance[methodName](
            ...handlerArgs,
            executionContext,
          );

          if (replyResult) await message.reply(replyResult);

          if (isRemoveMessage) await this.removeMessageFromChannel(message);
        } catch (exception) {
          const isTrowException = await this.filterResolver.applyFilter({
            instance,
            methodName,
            event,
            eventArgs,
            exception,
          });

          if (isTrowException) throw exception;
        }
      });
  }

  private getPrefix(messageContent: string, prefix: string): string {
    return messageContent.slice(0, prefix.length);
  }

  private getCommandName(messageContent: string, prefixLength: number): string {
    const messageWithoutPrefix = messageContent.slice(prefixLength);
    const command = messageWithoutPrefix.split(' ').shift();
    return command || '';
  }

  private async removeMessageFromChannel(message: Message): Promise<void> {
    await message.delete();
  }
}
