import { TransformPipe } from '@discord-nestjs/common';
import {
  Command,
  DiscordTransformedCommand,
  Payload,
  UseCollectors,
  UsePipes,
} from '@discord-nestjs/core';
import { MessageActionRowComponentBuilder } from '@discordjs/builders';
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
@UsePipes(TransformPipe)
@UseCollectors(PostInteractionCollector)
export class PlayCommand implements DiscordTransformedCommand<PlayDto> {
  async handler(@Payload() dto: PlayDto): Promise<InteractionReplyOptions> {
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
