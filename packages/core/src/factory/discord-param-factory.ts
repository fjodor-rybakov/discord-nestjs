import { ParamData } from '@nestjs/common';
import { ParamsFactory } from '@nestjs/core/helpers/external-context-creator';
import { ClientEvents } from 'discord.js';

import { EventContext } from '../definitions/interfaces/event-context';
import { BaseEvents } from '../definitions/types/event.type';
import { DiscordParamType } from './discord-param-type';

export class DiscordParamFactory implements ParamsFactory {
  exchangeKeyForValue(
    type: DiscordParamType,
    data: ParamData,
    args: [...ClientEvents[BaseEvents], EventContext],
  ) {
    switch (type) {
      case DiscordParamType.MESSAGE: {
        const message = args[0];

        return data && typeof data === 'string' && message
          ? message[data]
          : message;
      }
      case DiscordParamType.INTERACTION: {
        const interaction = args[0];

        return data && typeof data === 'string' && interaction
          ? interaction[data]
          : interaction;
      }
      case DiscordParamType.EVENT_PARAMS:
        return args;
      case DiscordParamType.APPLIED_COLLECTORS: {
        const { collectors } = args[args.length - 1] as EventContext;
        const index = data && Number(data);

        return !isNaN(index) && collectors && collectors.length
          ? collectors[index]
          : collectors;
      }
      default:
        return null;
    }
  }
}
