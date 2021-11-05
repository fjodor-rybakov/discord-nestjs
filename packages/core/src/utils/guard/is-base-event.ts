import { BaseEvents, EventType } from '../../definitions/types/event.type';
import { Constants } from 'discord.js';

export function IsBaseEvent(event: EventType): event is BaseEvents {
  return Object.values(Constants.Events).includes(event);
}
