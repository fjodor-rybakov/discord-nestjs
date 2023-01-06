import { Handler, SubCommand } from '@discord-nestjs/core';
import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  InteractionReplyOptions,
} from 'discord.js';

@SubCommand({ name: 'base-info', description: 'Base info' })
export class BaseInfoSubCommand {
  @Handler()
  onBaseInfoCommand(
    interaction: ChatInputCommandInteraction,
  ): InteractionReplyOptions {
    const { user } = interaction;

    const embed = new EmbedBuilder()
      .setImage(user.avatarURL())
      .addFields([{ name: 'Name', value: user.username }]);

    return {
      embeds: [embed],
    };
  }
}
