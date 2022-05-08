import {
  Command,
  DiscordCommand,
  InjectDiscordClient,
  On,
} from '@discord-nestjs/core';
import { Logger } from '@nestjs/common';
import {
  Modal,
  ModalSubmitInteraction,
  TextInputComponent,
  showModal,
} from 'discord-modals';
import { Client, CommandInteraction, Formatters } from 'discord.js';

@Command({
  name: 'show-modal',
  description: 'Show test modal',
})
export class PlayCommand implements DiscordCommand {
  private readonly logger = new Logger(PlayCommand.name);

  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
  ) {}

  async handler(interaction: CommandInteraction): Promise<void> {
    const modal = new Modal() // We create a Modal
      .setCustomId('modal-customid')
      .setTitle('Test of Discord-Modals!')
      .addComponents(
        new TextInputComponent() // We create a Text Input Component
          .setCustomId('textinput-customid')
          .setLabel('Some text Here')
          .setStyle('SHORT') //IMPORTANT: Text Input Component Style can be 'SHORT' or 'LONG'
          .setMinLength(4)
          .setMaxLength(10)
          .setPlaceholder('Write a text here')
          .setRequired(true), // If it's required or not
      );

    await showModal(modal, {
      client: this.client,
      interaction,
    });
  }

  @On('modalSubmit')
  async onModuleSubmit(modal: ModalSubmitInteraction) {
    this.logger.log(`Modal ${modal.customId} submit`);

    if (modal.customId === 'modal-customid') {
      const firstResponse = modal.getTextInputValue('textinput-customid');
      await modal.reply(
        'Congrats! Powered by discord-modals.' +
          Formatters.codeBlock('markdown', firstResponse),
      );
    }
  }
}
