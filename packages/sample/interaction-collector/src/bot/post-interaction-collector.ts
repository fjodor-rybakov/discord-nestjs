import { InteractionEventCollector, On, Once } from '@discord-nestjs/core';
import { ButtonInteraction } from 'discord.js';

@InteractionEventCollector({ time: 15000 })
export class PostInteractionCollector {
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
