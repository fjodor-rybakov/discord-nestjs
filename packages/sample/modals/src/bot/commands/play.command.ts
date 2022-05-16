import {
  Command,
  DiscordCommand,
  InjectDiscordClient,
  On,
  UseGuards,
} from '@discord-nestjs/core';
import { Logger } from '@nestjs/common';
import {
  Client,
  CommandInteraction,
  Formatters,
  MessageActionRow,
  Modal,
  ModalActionRowComponent,
  ModalSubmitInteraction,
  TextInputComponent,
} from 'discord.js';
import { TextInputStyles } from 'discord.js/typings/enums';

import { IsModalInteractionGuard } from '../guard/is-modal-interaction.guard';

@Command({
  name: 'submit-registration-request',
  description: 'Apply for registration',
})
export class PlayCommand implements DiscordCommand {
  private readonly logger = new Logger(PlayCommand.name);
  private readonly requestParticipantModalId = 'RequestParticipant';
  private readonly usernameComponentId = 'Username';
  private readonly commentComponentId = 'Comment';

  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
  ) {}

  async handler(interaction: CommandInteraction): Promise<void> {
    const modal = new Modal()
      .setTitle('Request participation')
      .setCustomId(this.requestParticipantModalId);

    const userNameInputComponent = new TextInputComponent()
      .setCustomId(this.usernameComponentId)
      .setLabel('Your username')
      .setStyle(TextInputStyles.SHORT);

    const commentInputComponent = new TextInputComponent()
      .setCustomId(this.commentComponentId)
      .setLabel('Add an explanatory comment')
      .setStyle(TextInputStyles.PARAGRAPH);

    const rows = [userNameInputComponent, commentInputComponent].map(
      (component) =>
        new MessageActionRow<ModalActionRowComponent>().addComponents(
          component,
        ),
    );

    modal.addComponents(...rows);

    await interaction.showModal(modal);
  }

  @On('interactionCreate')
  @UseGuards(IsModalInteractionGuard)
  async onModuleSubmit(modal: ModalSubmitInteraction) {
    this.logger.log(`Modal ${modal.customId} submit`);

    if (modal.customId !== this.requestParticipantModalId) return;

    const username = modal.fields.getTextInputValue(this.usernameComponentId);
    const comment = modal.fields.getTextInputValue(this.commentComponentId);

    await modal.reply(
      `${username}, your request has been submitted.` +
        Formatters.codeBlock('markdown', comment),
    );
  }
}
