import { Injectable, Logger } from '@nestjs/common';
import { ClientEvents, Message } from 'discord.js';

import { ExecutionContext } from '../../definitions/interfaces/execution-context';
import { ReflectMetadataProvider } from '../../providers/reflect-metadata.provider';
import { DiscordClientService } from '../../services/discord-client.service';
import { DiscordOptionService } from '../../services/discord-option.service';
import { DtoService } from '../../services/dto.service';
import { CollectorExplorer } from '../collector/collector.explorer';
import { FilterExplorer } from '../filter/filter.explorer';
import { GuardExplorer } from '../guard/guard.explorer';
import { MethodExplorer } from '../interfaces/method-explorer';
import { MethodExplorerOptions } from '../interfaces/method-explorer-options';
import { MiddlewareExplorer } from '../middleware/middleware.explorer';
import { PipeExplorer } from '../pipe/pipe.explorer';

@Injectable()
export class PrefixCommandExplorer implements MethodExplorer {
  private readonly logger = new Logger();

  constructor(
    private readonly metadataProvider: ReflectMetadataProvider,
    private readonly discordClientService: DiscordClientService,
    private readonly discordOptionService: DiscordOptionService,
    private readonly middlewareExplorer: MiddlewareExplorer,
    private readonly guardExplorer: GuardExplorer,
    private readonly filterExplorer: FilterExplorer,
    private readonly pipeExplorer: PipeExplorer,
    private readonly collectorExplorer: CollectorExplorer,
    private readonly dtoService: DtoService,
  ) {}

  async explore({
    instance,
    methodName,
  }: MethodExplorerOptions): Promise<void> {
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
      isRemovePrefix = prefixGlobalOptions?.isRemovePrefix ?? true,
      isIgnoreBotMessage = prefixGlobalOptions?.isIgnoreBotMessage ?? true,
      isRemoveCommandName = prefixGlobalOptions?.isRemoveCommandName ?? true,
      isRemoveMessage = prefixGlobalOptions?.isRemoveMessage ?? false,
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
          await this.middlewareExplorer.applyMiddleware(event, eventArgs);
          const isAllowFromGuards = await this.guardExplorer.applyGuard({
            instance,
            methodName,
            event,
            eventArgs,
          });
          if (!isAllowFromGuards) return;

          const pipeResult = await this.pipeExplorer.applyPipe({
            instance,
            methodName,
            event,
            metatype: dtoInstance?.constructor,
            eventArgs,
            initValue: message,
            commandNode: { dtoInstance },
          });
          //#endregion

          const collectors = await this.collectorExplorer.applyCollector({
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
          const isTrowException = await this.filterExplorer.applyFilter({
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
