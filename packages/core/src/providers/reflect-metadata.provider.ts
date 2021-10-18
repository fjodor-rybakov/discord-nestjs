import { CommandOptions } from '../decorators/command/command-options';
import { COMMAND_DECORATOR } from '../decorators/command/command.constant';
import { OnDecoratorOptions } from '../decorators/event/on-decorator-options';
import { ON_DECORATOR } from '../decorators/event/on/on.constant';
import { ONCE_DECORATOR } from '../decorators/event/once/once.constant';
import { CATCH_EXCEPTION_FILTER_DECORATOR } from '../decorators/filter/catch/catch.constant';
import { USE_FILTER_DECORATOR } from '../decorators/filter/use-filter.constant';
import { USE_GUARDS_DECORATOR } from '../decorators/guard/guard.constant';
import { DiscordMiddleware } from '../decorators/middleware/discord-middleware';
import { MiddlewareOptions } from '../decorators/middleware/middleware-options';
import { MIDDLEWARE_DECORATOR } from '../decorators/middleware/middleware.constant';
import { ArgOptions } from '../decorators/option/arg/arg-options';
import { ARG_DECORATOR } from '../decorators/option/arg/arg.constant';
import { CHANNEL_DECORATOR } from '../decorators/option/channel/channel.constant';
import { CHOICE_DECORATOR } from '../decorators/option/choice/choice.constant';
import { ParamTypeOptions } from '../decorators/param/param-type-options';
import { PAYLOAD_DECORATOR } from '../decorators/param/payload/payload.constant';
import { USE_PIPES_DECORATOR } from '../decorators/pipe/pipe.constant';
import { SubCommandOptions } from '../decorators/sub-command/sub-command-options';
import { SUB_COMMAND_DECORATOR } from '../decorators/sub-command/sub-command.constant';
import { ExcludeEnum } from '../definitions/types/exclude-enum.type';
import { FilterType } from '../definitions/types/filter.type';
import { GuardType } from '../definitions/types/guard.type';
import { PipeType } from '../definitions/types/pipe.type';
import { Injectable, Type } from '@nestjs/common';
import { ChannelTypes } from 'discord.js/typings/enums';

@Injectable()
export class ReflectMetadataProvider {
  getCommandDecoratorMetadata(instance: unknown): CommandOptions {
    return Reflect.getMetadata(COMMAND_DECORATOR, instance);
  }

  getSubCommandDecoratorMetadata(instance: unknown): SubCommandOptions {
    return Reflect.getMetadata(SUB_COMMAND_DECORATOR, instance);
  }

  getOnEventDecoratorMetadata(
    instance: unknown,
    methodName: string,
  ): OnDecoratorOptions {
    return Reflect.getMetadata(ON_DECORATOR, instance, methodName);
  }

  getOnceEventDecoratorMetadata(
    instance: unknown,
    methodName: string,
  ): OnDecoratorOptions {
    return Reflect.getMetadata(ONCE_DECORATOR, instance, methodName);
  }

  getMiddlewareDecoratorMetadata(
    instance: DiscordMiddleware,
  ): MiddlewareOptions {
    return Reflect.getMetadata(MIDDLEWARE_DECORATOR, instance);
  }

  getUseGuardsDecoratorMetadata(
    instance: unknown,
    methodName?: string,
  ): GuardType[] {
    return Reflect.getMetadata(USE_GUARDS_DECORATOR, instance, methodName);
  }

  getUsePipesDecoratorMetadata(
    instance: unknown,
    methodName?: string,
  ): PipeType[] {
    return Reflect.getMetadata(USE_PIPES_DECORATOR, instance, methodName);
  }

  getUseFiltersDecoratorMetadata(
    instance: unknown,
    methodName?: string,
  ): FilterType[] {
    return Reflect.getMetadata(USE_FILTER_DECORATOR, instance, methodName);
  }

  getCatchDecoratorMetadata(instance: unknown): Type[] {
    return Reflect.getMetadata(CATCH_EXCEPTION_FILTER_DECORATOR, instance);
  }

  getParamTypesMetadata(instance: unknown, methodName: string): Type[] {
    return Reflect.getMetadata('design:paramtypes', instance, methodName);
  }

  getPropertyTypeMetadata(instance: unknown, methodName: string): Type {
    return Reflect.getMetadata('design:type', instance, methodName);
  }

  getPayloadDecoratorMetadata(
    instance: unknown,
    methodName: string,
  ): ParamTypeOptions {
    return Reflect.getMetadata(PAYLOAD_DECORATOR, instance, methodName);
  }

  getArgDecoratorMetadata(instance: unknown, propertyKey: string): ArgOptions {
    return Reflect.getMetadata(ARG_DECORATOR, instance, propertyKey);
  }

  getChoiceDecoratorMetadata(
    instance: unknown,
    propertyKey: string,
  ): Record<string, any> {
    return Reflect.getMetadata(CHOICE_DECORATOR, instance, propertyKey);
  }

  getChannelDecoratorMetadata(
    instance: unknown,
    propertyKey: string,
  ): ExcludeEnum<typeof ChannelTypes, 'UNKNOWN'>[] {
    return Reflect.getMetadata(CHANNEL_DECORATOR, instance, propertyKey);
  }
}
