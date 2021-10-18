import {
  DiscordArgumentMetadata,
  DiscordExceptionFilter,
  Catch,
} from '@discord-nestjs/core';
import { ValidationError } from 'class-validator';

@Catch(ValidationError)
export class CommandValidationFilter implements DiscordExceptionFilter {
  async catch(
    exception: ValidationError[],
    metadata: DiscordArgumentMetadata<'interactionCreate'>,
  ): Promise<void> {
    const [interaction] = metadata.context;

    if (interaction.isCommand()) interaction.reply('Incorrect input');
  }
}
