import {
  Filter,
  InjectCauseEvent,
  InteractionEventCollector,
  On,
  Once,
} from '@discord-nestjs/core';
import { Injectable, Scope } from '@nestjs/common';
import { ButtonInteraction, ChatInputCommandInteraction } from 'discord.js';

@Injectable({ scope: Scope.REQUEST })
@InteractionEventCollector({ time: 15000 })
export class PostInteractionCollector {
  constructor(
    @InjectCauseEvent()
    private readonly causeInteraction: ChatInputCommandInteraction,
  ) {}

  @Filter()
  filter(interaction: ButtonInteraction): boolean {
    return this.causeInteraction.id === interaction.message.interaction.id;
  }

  @On('collect')
  async onCollect(interaction: ButtonInteraction): Promise<void> {
    await interaction.update({
      content: 'A button was clicked!',
      components: [],
    });
  }

  @Once('end')
  onEnd(): void {
    console.log('end');
  }
}
