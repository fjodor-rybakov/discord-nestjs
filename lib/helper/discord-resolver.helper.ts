import { Injectable } from '@nestjs/common';
import { Message } from 'discord.js';
import {
  CONTENT_DECORATOR,
  CONTEXT_DECORATOR,
  USE_GUARDS_DECORATOR,
  USE_INTERCEPTORS_DECORATOR,
} from '../constant/discord.constant';
import { DiscordParamDecoratorType } from '../interface/discord-param-decorator-type';
import { DecoratorParamType } from '../utils/enums/decorator-param-type';
import { DiscordGuard, DiscordInterceptor } from '..';
import { ConstructorType } from '../utils/type/constructor-type';

@Injectable()
export class DiscordResolverHelper {
  callHandler(
    instance: any,
    methodName: string,
    argsData: any[],
    eventName: string,
  ) {
    const contentMetadata = Reflect.getMetadata(
      CONTENT_DECORATOR,
      instance,
      methodName,
    ) as DiscordParamDecoratorType;
    const contextMetadata = Reflect.getMetadata(
      CONTEXT_DECORATOR,
      instance,
      methodName,
    ) as DiscordParamDecoratorType;
    if (contentMetadata || contextMetadata) {
      const args = [contentMetadata, contextMetadata]
        .filter((item: DiscordParamDecoratorType) => !!item)
        .sort((a: DiscordParamDecoratorType, b: DiscordParamDecoratorType) => {
          return a.parameterIndex - b.parameterIndex;
        })
        .map((item: DiscordParamDecoratorType) => {
          switch (item.type) {
            case DecoratorParamType.CONTENT: {
              if (eventName !== 'message') {
                throw new Error('Content allow only for message event');
              }
              return argsData[0].content;
            }
            case DecoratorParamType.CONTEXT: {
              return argsData;
            }
          }
        });
      instance[methodName](...args);
    } else {
      instance[methodName](...argsData);
    }
  }

  getInterceptorMetadata(
    instance: any,
    methodName: string,
  ): (DiscordInterceptor | ConstructorType)[] {
    return Reflect.getMetadata(
      USE_INTERCEPTORS_DECORATOR,
      instance,
      methodName,
    );
  }

  getGuardMetadata(
    instance: any,
    methodName: string,
  ): (DiscordGuard | ConstructorType)[] {
    return Reflect.getMetadata(USE_GUARDS_DECORATOR, instance, methodName);
  }
}
