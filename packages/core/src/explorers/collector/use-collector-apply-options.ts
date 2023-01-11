import { Type } from '@nestjs/common';
import { ClientEvents } from 'discord.js';

import { BaseEvents } from '../../definitions/types/event.type';

export interface UseCollectorApplyOptions {
  classType: Type;
  methodName: string;
  event: BaseEvents;
  eventArgs: ClientEvents[BaseEvents];
}
