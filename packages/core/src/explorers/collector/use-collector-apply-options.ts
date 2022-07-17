import { ClientEvents } from 'discord.js';

import { BaseEvents } from '../../definitions/types/event.type';

export interface UseCollectorApplyOptions {
  instance: InstanceType<any>;
  methodName: string;
  event: BaseEvents;
  eventArgs: ClientEvents[BaseEvents];
}
