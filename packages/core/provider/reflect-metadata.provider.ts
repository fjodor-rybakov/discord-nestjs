import { MetadataProvider } from './interface/metadata.provider.interface';
import { ArgNumOptions } from '../decorator/interface/arg-num-options';
import { ClientDecoratorOptions } from '../decorator/interface/client-decorator-options';
import { DiscordParamDecoratorType } from '../decorator/interface/param-decorator-type';
import { MiddlewareOptions } from '../decorator/interface/middleware-options';
import { OnCommandDecoratorOptions } from '../decorator/interface/on-command-decorator-options';
import { OnDecoratorOptions } from '../decorator/interface/on-decorator-options';
import { DecoratorConstant } from '../constant/decorator.constant';
import { Injectable } from '@nestjs/common';
import { GuardType } from '../util/type/guard-type';
import { PipeType } from '../util/type/pipe-type';
import { DiscordMiddleware } from '../decorator/interface/discord-middleware';
import { ArgRangeOptions } from '../decorator/interface/arg-range-options';

@Injectable()
export class ReflectMetadataProvider implements MetadataProvider {
  getArgNumDecoratorMetadata(instance: unknown, propertyKey: string): (last?: number) => ArgNumOptions {
    return Reflect.getMetadata(DecoratorConstant.ARG_NUM_DECORATOR, instance, propertyKey);
  }

  getArgRangeDecoratorMetadata(instance: unknown, propertyKey: string): (last?: number) => ArgRangeOptions {
    return Reflect.getMetadata(DecoratorConstant.ARG_RANGE_DECORATOR, instance, propertyKey);
  }

  getClientDecoratorMetadata(instance: unknown, propertyKey: string): ClientDecoratorOptions {
    return Reflect.getMetadata(DecoratorConstant.CLIENT_DECORATOR, instance, propertyKey);
  }

  getContentDecoratorMetadata(instance: unknown, methodName: string): DiscordParamDecoratorType {
    return Reflect.getMetadata(DecoratorConstant.CONTENT_DECORATOR, instance, methodName);
  }

  getContextDecoratorMetadata(instance: unknown, methodName: string): DiscordParamDecoratorType {
    return Reflect.getMetadata(DecoratorConstant.CONTEXT_DECORATOR, instance, methodName);
  }

  getParamTypesMetadata(instance: unknown, methodName: string): any[] {
    return Reflect.getMetadata('design:paramtypes', instance, methodName);
  }

  getMiddlewareDecoratorMetadata(instance: DiscordMiddleware): MiddlewareOptions {
    return Reflect.getMetadata(DecoratorConstant.MIDDLEWARE_DECORATOR, instance);
  }

  getOnCommandDecoratorMetadata(instance: unknown, methodName: string): OnCommandDecoratorOptions {
    return Reflect.getMetadata(DecoratorConstant.ON_COMMAND_DECORATOR, instance, methodName);
  }

  getOnMessageDecoratorMetadata(instance: unknown, methodName: string): OnDecoratorOptions {
    return Reflect.getMetadata(DecoratorConstant.ON_DECORATOR, instance, methodName);
  }

  getOnceMessageDecoratorMetadata(instance: unknown, methodName: string): OnDecoratorOptions {
    return Reflect.getMetadata(DecoratorConstant.ONCE_DECORATOR, instance, methodName);
  }

  getUseGuardsDecoratorMetadata(instance: unknown, methodName: string): GuardType[] {
    return Reflect.getMetadata(DecoratorConstant.USE_GUARDS_DECORATOR, instance, methodName);
  }

  getUsePipesDecoratorMetadata(instance: unknown, methodName: string): PipeType[] {
    return Reflect.getMetadata(DecoratorConstant.USE_PIPES_DECORATOR, instance, methodName);
  }
}