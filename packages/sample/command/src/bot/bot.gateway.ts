import { Injectable, Logger } from '@nestjs/common';
import { Command, On } from '@discord-nestjs/core';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import { SubCommandGroup } from '@discord-nestjs/core/src';

@Injectable()
@SubCommandGroup({ name: '', description: '' })
export class BotGateway {
  private readonly logger = new Logger(BotGateway.name);

  @On('ready')
  onReady() {
    this.logger.log('Bot was started!');
  }

  @Command({ name: 'self', description: 'Getting information about yourself' })
  async onCommand(interaction: CommandInteraction) {
    const embed = new MessageEmbed()
      .addField('Name: ', interaction.user.username)
      .setImage(interaction.user.avatarURL());

    await interaction.reply({ embeds: [embed] });
  }

  @Command({ name: 'reg', description: 'User registration' })
  async onRegistrationCommand() {}
}
