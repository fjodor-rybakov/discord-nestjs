import { DiscordCommand, SubCommand } from '@discord-nestjs/core';
import {
  CommandInteraction,
  EmbedBuilder,
  InteractionReplyOptions,
} from 'discord.js';

@SubCommand({ name: 'base-info', description: 'Base info' })
export class BaseInfoSubCommand implements DiscordCommand {
  handler(interaction: CommandInteraction): InteractionReplyOptions {
    const { user } = interaction;

    const embed = new EmbedBuilder()
      .setImage(user.avatarURL())
      .addFields([{ name: 'Name', value: user.username }]);

    return {
      embeds: [embed],
    };
  }
}
