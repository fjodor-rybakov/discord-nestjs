import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Message } from 'discord.js';
import { Observable, of, tap, throwError } from 'rxjs';

import { PrefixCommandOptions } from './prefix-command-options';

export class PrefixCommandInterceptor implements NestInterceptor {
  constructor(
    protected readonly commandName: string,
    protected readonly options: PrefixCommandOptions = {},
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const message = context.getArgByIndex(0);

    if (!(message instanceof Message))
      return throwError(
        () =>
          new Error(
            'Prefix command interceptor you can set only for "messageCreate" event',
          ),
      );

    const {
      isRemoveCommandName = true,
      isRemovePrefix = true,
      isIgnoreBotMessage = true,
      isRemoveMessage = false,
      prefix = '!',
    } = this.options;

    if (isIgnoreBotMessage && message.author.bot) return of(null);

    let messageContent = message.content.trim();
    const messagePrefix = this.getPrefix(messageContent, prefix);
    const commandName = this.getCommandName(
      messageContent,
      messagePrefix.length,
    );
    if (messagePrefix !== prefix || commandName !== this.commandName)
      return of(null); // not suitable for handler

    if (isRemovePrefix) messageContent = messageContent.slice(prefix.length);

    if (isRemoveCommandName)
      messageContent = isRemovePrefix
        ? messageContent.slice(prefix.length + commandName.length)
        : messageContent.substring(0, prefix.length) +
          messageContent.substring(prefix.length + commandName.length);

    message.content = messageContent.trim();

    return next.handle().pipe(
      tap(async () => {
        if (isRemoveMessage) await this.removeMessageFromChannel(message);
      }),
    );
  }

  protected getPrefix(messageContent: string, prefix: string): string {
    return messageContent.slice(0, prefix.length);
  }

  protected getCommandName(
    messageContent: string,
    prefixLength: number,
  ): string {
    const messageWithoutPrefix = messageContent.slice(prefixLength);
    const command = messageWithoutPrefix.split(' ').shift();
    return command || '';
  }

  protected async removeMessageFromChannel(message: Message): Promise<void> {
    await message.delete();
  }
}
