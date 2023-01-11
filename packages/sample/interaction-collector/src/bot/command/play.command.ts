import { CollectorInterceptor, SlashCommandPipe } from '@discord-nestjs/common';
import { Command, Handler, IA, UseCollectors } from '@discord-nestjs/core';
import { MessageActionRowComponentBuilder } from '@discordjs/builders';
import { UseInterceptors } from '@nestjs/common';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  InteractionReplyOptions,
} from 'discord.js';

import { PlayDto } from '../dto/play.dto';
import { PostInteractionCollector } from '../post-interaction-collector';

@Command({
  name: 'play',
  description: 'Plays a song',
})
@UseInterceptors(CollectorInterceptor)
@UseCollectors(PostInteractionCollector)
export class PlayCommand {
  @Handler()
  async onPlayCommand(
    @IA(SlashCommandPipe) dto: PlayDto,
  ): Promise<InteractionReplyOptions> {
    const row =
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId('primary')
          .setLabel(dto.song)
          .setStyle(ButtonStyle.Primary),
      );

    return {
      content: 'Click on the button to play the song!',
      components: [row],
    };
  }
}
