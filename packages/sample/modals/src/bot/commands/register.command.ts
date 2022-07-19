import { ModalFieldsTransformPipe } from '@discord-nestjs/common';
import {
  Command,
  DiscordCommand,
  InjectDiscordClient,
  On,
  Payload,
  UseGuards,
  UsePipes,
} from '@discord-nestjs/core';
import { ModalActionRowComponentBuilder } from '@discordjs/builders';
import { Logger } from '@nestjs/common';
import {
  ActionRowBuilder,
  Client,
  CommandInteraction,
  Formatters,
  ModalBuilder,
  ModalSubmitInteraction,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';

import { IsModalInteractionGuard } from '../guard/is-modal-interaction.guard';
import { FormDto } from './dto/form.dto';

@Command({
  name: 'submit-registration-request',
  description: 'Apply for registration',
})
export class RegisterCommand implements DiscordCommand {
  private readonly logger = new Logger(RegisterCommand.name);
  private readonly requestParticipantModalId = 'RequestParticipant';
  private readonly usernameComponentId = 'Username';
  private readonly commentComponentId = 'comment';

  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
  ) {}

  async handler(interaction: CommandInteraction): Promise<void> {
    const modal = new ModalBuilder()
      .setTitle('Request participation')
      .setCustomId(this.requestParticipantModalId);

    const userNameInputComponent = new TextInputBuilder()
      .setCustomId(this.usernameComponentId)
      .setLabel('Your username')
      .setStyle(TextInputStyle.Short);

    const commentInputComponent = new TextInputBuilder()
      .setCustomId(this.commentComponentId)
      .setLabel('Add an explanatory comment')
      .setStyle(TextInputStyle.Paragraph);

    const rows = [userNameInputComponent, commentInputComponent].map(
      (component) =>
        new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
          component,
        ),
    );

    modal.addComponents(...rows);

    await interaction.showModal(modal);
  }

  @On('interactionCreate')
  @UsePipes(ModalFieldsTransformPipe) // ModalFieldsTransformPipe is required if you want use DTO
  @UseGuards(IsModalInteractionGuard)
  async onModuleSubmit(
    @Payload() { username, comment }: FormDto,
    modal: ModalSubmitInteraction,
  ) {
    this.logger.log(`Modal ${modal.customId} submit`);

    if (modal.customId !== this.requestParticipantModalId) return;

    await modal.reply(
      `${username.value}, your request has been submitted.` +
        Formatters.codeBlock('markdown', comment),
    );
  }
}
