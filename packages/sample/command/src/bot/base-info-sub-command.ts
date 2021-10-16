import { DiscordCommand, SubCommand } from '@discord-nestjs/core';
import { CommandInteraction } from 'discord.js';

@SubCommand({ name: 'base-info', description: 'Base info' })
export class BaseInfoSubCommand implements DiscordCommand {
  handler(interaction: CommandInteraction): string {
    console.log('Base info', interaction);
    return 'Success base subcommand';
  }
}
