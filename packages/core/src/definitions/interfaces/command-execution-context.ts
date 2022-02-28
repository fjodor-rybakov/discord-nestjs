import {
  Interaction,
  InteractionCollector,
  MessageCollector,
} from 'discord.js';

export interface CommandExecutionContext<
  TInteraction extends Interaction = any,
> {
  collectors: (MessageCollector | InteractionCollector<TInteraction>)[];
}
