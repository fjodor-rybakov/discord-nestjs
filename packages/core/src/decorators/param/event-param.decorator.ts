import {
  PipeTransform,
  Type,
  assignMetadata,
  createParamDecorator,
} from '@nestjs/common';
import { isNil, isString } from '@nestjs/common/utils/shared.utils';

import { DiscordParamType } from '../../factory/discord-param-type';
import { EVENT_PARAMS_DECORATOR } from './event-param.constant';

/**
 * Extract `Interaction` instance from event params
 */
export function InteractionEvent(
  property?: string | (Type<PipeTransform> | PipeTransform),
  ...pipes: (Type<PipeTransform> | PipeTransform)[]
): ParameterDecorator {
  return createPipesEventParamDecorator(DiscordParamType.INTERACTION)(
    property,
    ...pipes,
  );
}

export const EventParams = createParamDecorator<string, any[]>(
  (data, input) => {
    return input.getArgs();
  },
);

export function AppliedCollectors(
  index?: number | (Type<PipeTransform> | PipeTransform),
  ...pipes: (Type<PipeTransform> | PipeTransform)[]
): ParameterDecorator {
  return createPipesEventParamDecorator(DiscordParamType.APPLIED_COLLECTORS)(
    index.toString(),
    ...pipes,
  );
}

/**
 * Extract `Message` instance from event params
 */
export function MessageEvent(
  property?: string | (Type<PipeTransform> | PipeTransform),
  ...pipes: (Type<PipeTransform> | PipeTransform)[]
): ParameterDecorator {
  return createPipesEventParamDecorator(DiscordParamType.MESSAGE)(
    property,
    ...pipes,
  );
}

/**
 * Alias for `MessageEvent` decorator
 */
export const MSG = MessageEvent;
/**
 * Alias for `InteractionEvent` decorator
 */
export const IA = InteractionEvent;

const createPipesEventParamDecorator =
  (paramtype: DiscordParamType) =>
  (
    data?: any,
    ...pipes: (Type<PipeTransform> | PipeTransform)[]
  ): ParameterDecorator =>
  (target, key, index) => {
    const args =
      Reflect.getMetadata(EVENT_PARAMS_DECORATOR, target.constructor, key) ||
      {};
    const hasParamData = isNil(data) || isString(data);
    const paramData = hasParamData ? data : void 0;
    const paramPipes = hasParamData ? pipes : [data, ...pipes];

    Reflect.defineMetadata(
      EVENT_PARAMS_DECORATOR,
      assignMetadata(args, paramtype, index, paramData, ...paramPipes),
      target.constructor,
      key,
    );
  };
