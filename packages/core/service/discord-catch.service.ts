import { Injectable } from '@nestjs/common';
import { ValidationProvider } from '../provider/validation.provider';
import { ValidationError } from 'class-validator';
import { DiscordAPIError, Message } from 'discord.js';

@Injectable()
export class DiscordCatchService {
  constructor(
    private readonly validationProvider: ValidationProvider
  ) {
  }

  async pipeExceptionFactory(
    err: Error | ValidationError[] | DiscordAPIError,
    message: Message
  ): Promise<void> {
    const messageEmbed = this.validationProvider.getErrorMessage() ??
      this.validationProvider.getDefaultErrorMessage(err, message.content);
    await message.reply(messageEmbed);
  }
}