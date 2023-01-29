import {
  InteractionCollector,
  MappedInteractionTypes,
  MessageCollector,
  MessageComponentType,
  ReactionCollector,
} from 'discord.js';

import { BaseEvents } from '../types/event.type';

export interface EventContext {
  event: BaseEvents;

  collectors: (
    | ReactionCollector
    | MessageCollector
    | InteractionCollector<MappedInteractionTypes[MessageComponentType]>
  )[];
}
