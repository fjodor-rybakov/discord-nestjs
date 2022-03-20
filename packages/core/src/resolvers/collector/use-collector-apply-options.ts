import { ClientEvents } from 'discord.js';

type TEvent = keyof ClientEvents;

export interface UseCollectorApplyOptions {
  instance: InstanceType<any>;
  methodName: string;
  event: TEvent;
  eventArgs: ClientEvents[TEvent];
}
