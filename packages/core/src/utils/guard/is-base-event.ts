import { Events } from 'discord.js';

import { BaseEvents, EventType } from '../../definitions/types/event.type';

export function IsBaseEvent(event: EventType): event is BaseEvents {
  return Object.values(Events as unknown).includes(event);
}
