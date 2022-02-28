import {
  Collection,
  Interaction,
  Message,
  MessageReaction,
  Snowflake,
  User,
} from 'discord.js';

import { CollectorEvents } from './event.type';

export type MessageCollectorType<TEventName extends CollectorEvents> =
  TEventName extends 'collect' | 'dispose'
    ? [...args: [Message, ...unknown[]]]
    : TEventName extends 'end'
    ? [collected: Collection<Snowflake, MessageReaction>]
    : [...args: any[]];

export type ReactCollectorType<TEventName extends CollectorEvents> =
  TEventName extends 'collect' | 'dispose' | 'remove'
    ? [reaction: MessageReaction, user: User]
    : TEventName extends 'end'
    ? [collected: Collection<Snowflake, MessageReaction>, reason: string]
    : [...args: any[]];

export type InteractionCollectorType<
  TEventName extends CollectorEvents,
  TInteraction extends Interaction,
> = TEventName extends 'collect' | 'dispose'
  ? [...args: [TInteraction, ...unknown[]]]
  : TEventName extends 'end'
  ? [collected: Collection<Snowflake, TInteraction>, reason: string]
  : [...args: any[]];

export type CollectorArgsType<
  TEventName extends CollectorEvents,
  TInteraction extends Interaction = any,
> =
  | ReactCollectorType<TEventName>
  | MessageCollectorType<TEventName>
  | InteractionCollectorType<TEventName, TInteraction>;
