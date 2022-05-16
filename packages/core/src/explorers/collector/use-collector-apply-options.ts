import { ClientEvents } from 'discord.js';

import { BaseEvents } from '../../definitions/types/event.type';

export interface UseCollectorApplyOptions {
  instance: InstanceType<any>;
  methodName: string;
  event: BaseEvents;
  // TODO: Remove ts-ignore after release in discord.js
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  eventArgs: ClientEvents[BaseEvents];
}
