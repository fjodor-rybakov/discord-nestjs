import { Filter, On, Once, ReactionEventCollector } from '@discord-nestjs/core';
import { Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { MessageReaction, ReactionCollector, User } from 'discord.js';

@ReactionEventCollector({ time: 15000 })
export class AppreciatedReactionCollector {
  constructor(
    @Inject(REQUEST)
    private readonly collector: ReactionCollector,
  ) {}

  @Filter()
  isLikeFromAuthor(reaction: MessageReaction, user: User): boolean {
    return (
      reaction.emoji.name === '👍' && user.id === reaction.message.author.id
    );
  }

  @On('collect')
  onCollect(): void {
    console.log('collect');
  }

  @Once('end')
  onEnd(): void {
    console.log('end');
  }
}
