import { ClientEvents } from 'discord.js';

export type BaseEvents = keyof ClientEvents;
export type CollectorEvents = 'collect' | 'dispose' | 'end' | 'remove' | string;

export type EventType = BaseEvents | CollectorEvents;
