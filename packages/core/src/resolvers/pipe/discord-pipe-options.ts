import { Type } from '@nestjs/common';

import { EventArgs, EventType } from '../../definitions/types/event.type';

export interface DiscordPipeOptions<TEvent extends EventType = any> {
  instance: unknown;
  methodName: string;
  event: TEvent;
  eventArgs: EventArgs<TEvent>;
  initValue?: unknown;
  metatype?: Type;
  commandNode?: Record<string, any>;
}
