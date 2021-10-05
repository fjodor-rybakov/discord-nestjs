import { Injectable } from '@nestjs/common';
import { COMMAND_DECORATOR } from '../decorators/command/command.constant';
import { OnDecoratorOptions } from '../decorators/event/on-decorator-options';
import { ON_DECORATOR } from '../decorators/event/on/on.constant';
import { GuardType } from '../definitions/types/guard.type';
import { PipeType } from '../definitions/types/pipe.type';
import { USE_GUARDS_DECORATOR } from '../decorators/guard/guard.constant';
import { USE_PIPES_DECORATOR } from '../decorators/pipe/pipe.constant';
import { MiddlewareOptions } from '../decorators/middleware/middleware-options';
import { DiscordMiddleware } from '../decorators/middleware/discord-middleware';
import { MIDDLEWARE_DECORATOR } from '../decorators/middleware/middleware.constant';
import { ONCE_DECORATOR } from '../decorators/event/once/once.constant';
import { CommandOptions } from '../decorators/command/command-options';
import { ARG_DECORATOR } from '../decorators/option/arg/arg.constant';
import { CHOICE_DECORATOR } from '../decorators/option/choice/choice.constant';
import { ArgOptions } from '../decorators/option/arg/arg-options';
import { SUB_COMMAND_DECORATOR } from '../decorators/command/sub-command/sub-command.constant';
import { SUB_COMMAND_GROUP_DECORATOR } from '../decorators/sub-command-group/sub-command-group.constant';

@Injectable()
export class ReflectMetadataProvider {
  getCommandDecoratorMetadata(
    instance: unknown,
    methodName: string,
  ): CommandOptions {
    return Reflect.getMetadata(COMMAND_DECORATOR, instance, methodName);
  }

  getSubCommandDecoratorMetadata(
    instance: unknown,
    methodName: string,
  ): CommandOptions {
    return Reflect.getMetadata(SUB_COMMAND_DECORATOR, instance, methodName);
  }

  getSubCommandGroupDecoratorMetadata(instance: unknown): Record<string, any> {
    return Reflect.getMetadata(SUB_COMMAND_GROUP_DECORATOR, instance);
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

  getArgDecoratorMetadata(instance: unknown, propertyKey: string): ArgOptions {
    return Reflect.getMetadata(ARG_DECORATOR, instance, propertyKey);
  }

  getChoiceDecoratorMetadata(
    instance: unknown,
    propertyKey: string,
  ): Record<string, any> {
    return Reflect.getMetadata(CHOICE_DECORATOR, instance, propertyKey);
  }
}
