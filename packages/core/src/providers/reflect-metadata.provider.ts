import { Injectable, Type } from '@nestjs/common';
import {
  ChannelType,
  MessageChannelCollectorOptionsParams,
  MessageCollectorOptions,
  MessageComponentType,
} from 'discord.js';

import { FILTER_METADATA } from '../decorators/collector/filter/filter.constant';
import { INTERACTION_COLLECTOR_METADATA } from '../decorators/collector/interaction-collector/interaction-collector.constant';
import { MESSAGE_COLLECTOR_METADATA } from '../decorators/collector/message-collector/message-collector.constant';
import { DiscordReactionCollectorOptions } from '../decorators/collector/reaction-collector/reaction-collector-options';
import { REACTION_COLLECTOR_METADATA } from '../decorators/collector/reaction-collector/reaction-collector.constant';
import { USE_COLLECTORS_METADATA } from '../decorators/collector/use-collectors/use-collectors.constant';
import { CommandOptions } from '../decorators/command/command-options';
import { COMMAND_DECORATOR } from '../decorators/command/command.constant';
import { OnCollectDecoratorOptions } from '../decorators/event/on-collect-decorator-options';
import { OnDecoratorOptions } from '../decorators/event/on-decorator-options';
import {
  ON_COLLECT_DECORATOR,
  ON_DECORATOR,
} from '../decorators/event/on/on.constant';
import {
  ONCE_COLLECT_DECORATOR,
  ONCE_DECORATOR,
} from '../decorators/event/once/once.constant';
import { CATCH_EXCEPTION_FILTER_DECORATOR } from '../decorators/filter/catch/catch.constant';
import { USE_FILTER_DECORATOR } from '../decorators/filter/use-filter.constant';
import { USE_GUARDS_DECORATOR } from '../decorators/guard/guard.constant';
import { DiscordMiddleware } from '../decorators/middleware/discord-middleware';
import { MiddlewareOptions } from '../decorators/middleware/middleware-options';
import { MIDDLEWARE_DECORATOR } from '../decorators/middleware/middleware.constant';
import { FieldOptions } from '../decorators/modal/field/field-options';
import { FIELD_DECORATOR } from '../decorators/modal/field/field.constant';
import { TEXT_INPUT_VALUE_DECORATOR } from '../decorators/modal/text-input-value/text-input-value.constant';
import { CHANNEL_DECORATOR } from '../decorators/option/channel/channel.constant';
import { CHOICE_DECORATOR } from '../decorators/option/choice/choice.constant';
import { NonParamOptions } from '../decorators/option/param/non-param-options';
import { NumericParamOptions } from '../decorators/option/param/numeric-param-options';
import { PARAM_DECORATOR } from '../decorators/option/param/param.constant';
import { StringParamOptions } from '../decorators/option/param/string-param-options';
import { ParamTypeOptions } from '../decorators/param/param-type-options';
import { PAYLOAD_DECORATOR } from '../decorators/param/payload/payload.constant';
import { USE_PIPES_DECORATOR } from '../decorators/pipe/pipe.constant';
import { PrefixCommandOptions } from '../decorators/prefix-command/prefix-command-options';
import { ON_PREFIX_COMMAND_DECORATOR } from '../decorators/prefix-command/prefix-command.constant';
import { SubCommandOptions } from '../decorators/sub-command/sub-command-options';
import { SUB_COMMAND_DECORATOR } from '../decorators/sub-command/sub-command.constant';
import { ArgNumOptions } from '../decorators/transformation/arg-num/arg-num-options';
import { ARG_NUM_DECORATOR } from '../decorators/transformation/arg-num/arg-num.constant';
import { ArgRangeOptions } from '../decorators/transformation/arg-range/arg-range-options';
import { ARG_RANGE_DECORATOR } from '../decorators/transformation/arg-range/arg-range.constant';
import { FilterType } from '../definitions/types/filter.type';
import { GuardType } from '../definitions/types/guard.type';
import { PipeType } from '../definitions/types/pipe.type';

@Injectable()
export class ReflectMetadataProvider {
  getCommandDecoratorMetadata(instance: InstanceType<any>): CommandOptions {
    return Reflect.getMetadata(COMMAND_DECORATOR, instance);
  }

  getSubCommandDecoratorMetadata(
    instance: InstanceType<any>,
  ): SubCommandOptions {
    return Reflect.getMetadata(SUB_COMMAND_DECORATOR, instance);
  }

  getOnEventDecoratorMetadata(
    instance: InstanceType<any>,
    methodName: string,
  ): OnDecoratorOptions {
    return Reflect.getMetadata(ON_DECORATOR, instance, methodName);
  }

  getOnceEventDecoratorMetadata(
    instance: InstanceType<any>,
    methodName: string,
  ): OnDecoratorOptions {
    return Reflect.getMetadata(ONCE_DECORATOR, instance, methodName);
  }

  getOnCommandDecoratorMetadata(
    instance: InstanceType<any>,
    methodName: string,
  ): PrefixCommandOptions {
    return Reflect.getMetadata(
      ON_PREFIX_COMMAND_DECORATOR,
      instance,
      methodName,
    );
  }

  getArgNumDecoratorMetadata(
    instance: InstanceType<any>,
    propertyKey: string,
  ): (last?: number) => ArgNumOptions {
    return Reflect.getMetadata(ARG_NUM_DECORATOR, instance, propertyKey);
  }

  getArgRangeDecoratorMetadata(
    instance: InstanceType<any>,
    propertyKey: string,
  ): (last?: number) => ArgRangeOptions {
    return Reflect.getMetadata(ARG_RANGE_DECORATOR, instance, propertyKey);
  }

  getOnCollectEventDecoratorMetadata(
    instance: InstanceType<any>,
    methodName: string,
  ): OnCollectDecoratorOptions {
    return Reflect.getMetadata(ON_COLLECT_DECORATOR, instance, methodName);
  }

  getOnceCollectEventDecoratorMetadata(
    instance: InstanceType<any>,
    methodName: string,
  ): OnCollectDecoratorOptions {
    return Reflect.getMetadata(ONCE_COLLECT_DECORATOR, instance, methodName);
  }

  getFilterDecoratorMetadata(
    instance: InstanceType<any>,
    methodName: string,
  ): Record<string, any> {
    return Reflect.getMetadata(FILTER_METADATA, instance, methodName);
  }

  getMiddlewareDecoratorMetadata(
    instance: DiscordMiddleware,
  ): MiddlewareOptions {
    return Reflect.getMetadata(MIDDLEWARE_DECORATOR, instance);
  }

  getUseGuardsDecoratorMetadata(
    instance: InstanceType<any>,
    methodName?: string,
  ): GuardType[] {
    return Reflect.getMetadata(USE_GUARDS_DECORATOR, instance, methodName);
  }

  getUsePipesDecoratorMetadata(
    instance: InstanceType<any>,
    methodName?: string,
  ): PipeType[] {
    return Reflect.getMetadata(USE_PIPES_DECORATOR, instance, methodName);
  }

  getUseFiltersDecoratorMetadata(
    instance: InstanceType<any>,
    methodName?: string,
  ): FilterType[] {
    return Reflect.getMetadata(USE_FILTER_DECORATOR, instance, methodName);
  }

  getCatchDecoratorMetadata(instance: InstanceType<any>): Type[] {
    return Reflect.getMetadata(CATCH_EXCEPTION_FILTER_DECORATOR, instance);
  }

  getParamTypesMetadata(
    instance: InstanceType<any>,
    methodName: string,
  ): Type[] {
    return Reflect.getMetadata('design:paramtypes', instance, methodName);
  }

  getPropertyTypeMetadata(
    instance: InstanceType<any>,
    methodName: string,
  ): Type {
    return Reflect.getMetadata('design:type', instance, methodName);
  }

  getPayloadDecoratorMetadata(
    instance: InstanceType<any>,
    methodName: string,
  ): ParamTypeOptions {
    return Reflect.getMetadata(PAYLOAD_DECORATOR, instance, methodName);
  }

  getParamDecoratorMetadata(
    instance: InstanceType<any>,
    propertyKey: string,
  ): NumericParamOptions & StringParamOptions & NonParamOptions {
    return Reflect.getMetadata(PARAM_DECORATOR, instance, propertyKey);
  }

  getChoiceDecoratorMetadata(
    instance: InstanceType<any>,
    propertyKey: string,
  ): Record<string, any> | Map<string, string | number> {
    return Reflect.getMetadata(CHOICE_DECORATOR, instance, propertyKey);
  }

  getChannelDecoratorMetadata(
    instance: InstanceType<any>,
    propertyKey: string,
  ): ChannelType[] {
    return Reflect.getMetadata(CHANNEL_DECORATOR, instance, propertyKey);
  }

  getReactionCollectorDecoratorMetadata(
    instance: InstanceType<any>,
  ): DiscordReactionCollectorOptions {
    return Reflect.getMetadata(REACTION_COLLECTOR_METADATA, instance);
  }

  getMessageCollectorDecoratorMetadata(
    instance: InstanceType<any>,
  ): MessageCollectorOptions {
    return Reflect.getMetadata(MESSAGE_COLLECTOR_METADATA, instance);
  }

  getInteractionCollectorDecoratorMetadata<T extends MessageComponentType>(
    instance: InstanceType<any>,
  ): MessageChannelCollectorOptionsParams<T, true> {
    return Reflect.getMetadata(INTERACTION_COLLECTOR_METADATA, instance);
  }

  getUseCollectorsDecoratorMetadata(
    instance: InstanceType<any>,
    methodName?: string,
  ): Type[] {
    return Reflect.getMetadata(USE_COLLECTORS_METADATA, instance, methodName);
  }

  getFiledDecoratorMetadata(
    instance: InstanceType<any>,
    propertyKey: string,
  ): FieldOptions {
    return Reflect.getMetadata(FIELD_DECORATOR, instance, propertyKey);
  }

  getTextInputValueDecoratorMetadata(
    instance: InstanceType<any>,
    propertyKey: string,
  ): { customId?: string } {
    return Reflect.getMetadata(
      TEXT_INPUT_VALUE_DECORATOR,
      instance,
      propertyKey,
    );
  }
}
