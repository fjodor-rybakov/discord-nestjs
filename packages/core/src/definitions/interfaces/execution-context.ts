import {
  ClientEvents,
  Interaction,
  InteractionCollector,
  MessageCollector,
  ReactionCollector,
} from 'discord.js';

export interface ExecutionContext<
  EventName extends keyof ClientEvents,
  TInteraction extends Interaction = any,
> {
  eventArgs: ClientEvents[EventName];
  collectors: (
    | ReactionCollector
    | MessageCollector
    | InteractionCollector<TInteraction>
  )[];
}
