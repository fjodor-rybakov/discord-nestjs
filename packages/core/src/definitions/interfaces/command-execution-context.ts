import {
  CollectedInteraction,
  InteractionCollector,
  MessageCollector,
} from 'discord.js';

export interface CommandExecutionContext<
  TInteraction extends CollectedInteraction = any,
> {
  collectors?: (MessageCollector | InteractionCollector<TInteraction>)[];
}
