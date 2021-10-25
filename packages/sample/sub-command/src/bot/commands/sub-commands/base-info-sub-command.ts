import { DiscordCommand, SubCommand } from '@discord-nestjs/core';
import {
  CommandInteraction,
  InteractionReplyOptions,
  MessageEmbed,
} from 'discord.js';

@SubCommand({ name: 'base-info', description: 'Base info' })
export class BaseInfoSubCommand implements DiscordCommand {
  handler(interaction: CommandInteraction): InteractionReplyOptions {
    const { user } = interaction;

    const embed = new MessageEmbed()
      .setImage(user.avatarURL())
      .addField('Name', user.username);

    return {
      embeds: [embed],
    };
  }
}
