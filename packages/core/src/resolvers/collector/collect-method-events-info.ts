import { CollectorEvents } from '../../definitions/types/event.type';

export interface CollectMethodEventsInfo {
  [methodName: string]: {
    eventName: CollectorEvents;
    eventMethod: 'on' | 'once';
  };
}
