import {
  Interaction,
  InteractionCollector,
  MappedInteractionTypes,
  Message,
  MessageCollector,
  MessageComponentType,
  ReactionCollector,
} from 'discord.js';

export interface RequestPayload {
  collector:
    | ReactionCollector
    | MessageCollector
    | InteractionCollector<MappedInteractionTypes[MessageComponentType]>;

  causeEvent: Message | Interaction;
}
