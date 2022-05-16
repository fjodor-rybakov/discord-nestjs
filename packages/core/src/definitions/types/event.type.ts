import { ClientEvents, Interaction } from 'discord.js';

import { CollectorArgsType } from './collector-args.type';

/**
 * @deprecated use interactionCreate instead
 */
type ModalSubmit = 'modalSubmit';

export type BaseEvents = keyof ClientEvents | ModalSubmit;
export type CollectorEvents = 'collect' | 'dispose' | 'end' | 'remove' | string;

export type EventType = BaseEvents | CollectorEvents;

export type EventArgs<
  TEvent extends EventType,
  TInteraction extends Interaction = any,
> = TEvent extends keyof ClientEvents
  ? ClientEvents[TEvent]
  : CollectorArgsType<TEvent, TInteraction>;
