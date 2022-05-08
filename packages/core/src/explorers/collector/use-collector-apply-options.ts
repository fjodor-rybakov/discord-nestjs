import { ClientEvents } from 'discord.js';

type TEvent = keyof ClientEvents | 'modalSubmit';

export interface UseCollectorApplyOptions {
  instance: InstanceType<any>;
  methodName: string;
  event: TEvent;
  // TODO: Remove ts-ignore after release in discord.js
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  eventArgs: ClientEvents[TEvent];
}
