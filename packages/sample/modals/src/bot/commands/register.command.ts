import { ModalFieldsTransformPipe } from '@discord-nestjs/common';
import {
  Command,
  EventParams,
  Handler,
  IA,
  InjectDiscordClient,
  On,
} from '@discord-nestjs/core';
import type { ModalActionRowComponentBuilder } from '@discordjs/builders';
import { Logger, UseGuards } from '@nestjs/common';
import {
  ActionRowBuilder,
  Client,
  ClientEvents,
  CommandInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  codeBlock,
} from 'discord.js';

import { IsModalInteractionGuard } from '../guard/is-modal-interaction.guard';
import { FormDto } from './dto/form.dto';

@Command({
  name: 'submit-registration-request',
  description: 'Apply for registration',
})
export class RegisterCommand {
  private readonly logger = new Logger(RegisterCommand.name);
  private readonly requestParticipantModalId = 'RequestParticipant';
  private readonly usernameComponentId = 'Username';
  private readonly commentComponentId = 'comment';

  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
  ) {}

  @Handler()
  async onRegisterCommand(interaction: CommandInteraction): Promise<void> {
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
  @UseGuards(IsModalInteractionGuard)
  async onModuleSubmit(
    @IA(ModalFieldsTransformPipe) { username, comment }: FormDto,
    @EventParams() eventArgs: ClientEvents['interactionCreate'],
  ): Promise<void> {
    const [modal] = eventArgs;

    if (!modal.isModalSubmit()) return;

    this.logger.log(`Modal ${modal.customId} submit`);

    if (modal.customId !== this.requestParticipantModalId) return;

    await modal.reply(
      `${username.value}, your request has been submitted.` +
        codeBlock('markdown', comment),
    );
  }
}
