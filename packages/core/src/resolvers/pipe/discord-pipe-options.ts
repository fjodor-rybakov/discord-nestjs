import { Type } from '@nestjs/common';

import { EventArgs, EventType } from '../../definitions/types/event.type';
import { CommandNode } from '../../definitions/types/tree/command-node';

export interface DiscordPipeOptions<TEvent extends EventType = any> {
  instance: unknown;
  methodName: string;
  event: TEvent;
  eventArgs: EventArgs<TEvent>;
  initValue?: unknown;
  metatype?: Type;
  commandNode?: CommandNode;
}
