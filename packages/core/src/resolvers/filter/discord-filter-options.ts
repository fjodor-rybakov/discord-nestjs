import { Type } from '@nestjs/common';

import { EventArgs, EventType } from '../../definitions/types/event.type';

export interface DiscordFilterOptions<
  TException extends Error = any,
  TEvent extends EventType = any,
> {
  instance: InstanceType<any>;
  methodName: string;
  event: TEvent;
  eventArgs: EventArgs<TEvent>;
  exception?: TException;
  metatype?: Type;
  commandNode?: Record<string, any>;
}
