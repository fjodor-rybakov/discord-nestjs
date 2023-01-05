import { PipeTransform, Type, assignMetadata } from '@nestjs/common';
import { isNil, isString } from '@nestjs/common/utils/shared.utils';

import { DiscordParamType } from '../../factory/discord-param-type';
import { EVENT_ARGS_DECORATOR } from './event-param.constant';

export function InteractionEvent(
  property?: string | (Type<PipeTransform> | PipeTransform),
  ...pipes: (Type<PipeTransform> | PipeTransform)[]
): ParameterDecorator {
  return createPipesEventParamDecorator(DiscordParamType.INTERACTION)(
    property,
    ...pipes,
  );
}

export function MessageEvent(
  property?: string | (Type<PipeTransform> | PipeTransform),
  ...pipes: (Type<PipeTransform> | PipeTransform)[]
): ParameterDecorator {
  return createPipesEventParamDecorator(DiscordParamType.MESSAGE)(
    property,
    ...pipes,
  );
}

export const MSG = MessageEvent;
export const IA = InteractionEvent;

const createPipesEventParamDecorator =
  (paramtype: DiscordParamType) =>
  (
    data?: any,
    ...pipes: (Type<PipeTransform> | PipeTransform)[]
  ): ParameterDecorator =>
  (target, key, index) => {
    const args =
      Reflect.getMetadata(EVENT_ARGS_DECORATOR, target.constructor, key) || {};
    const hasParamData = isNil(data) || isString(data);
    const paramData = hasParamData ? data : void 0;
    const paramPipes = hasParamData ? pipes : [data, ...pipes];

    Reflect.defineMetadata(
      EVENT_ARGS_DECORATOR,
      assignMetadata(args, paramtype, index, paramData, ...paramPipes),
      target.constructor,
      key,
    );
  };
