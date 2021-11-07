import { EventArgs, EventType } from '../../definitions/types/event.type';

export interface DiscordGuardOptions<TEvent extends EventType = any> {
  instance: unknown;
  methodName: string;
  event: TEvent;
  eventArgs: EventArgs<TEvent>;
}
