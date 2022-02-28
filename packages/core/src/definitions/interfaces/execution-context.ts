import {
  Interaction,
  InteractionCollector,
  MessageCollector,
  ReactionCollector,
} from 'discord.js';

export interface ExecutionContext<TInteraction extends Interaction = any> {
  collectors: (
    | ReactionCollector
    | MessageCollector
    | InteractionCollector<TInteraction>
  )[];
}
