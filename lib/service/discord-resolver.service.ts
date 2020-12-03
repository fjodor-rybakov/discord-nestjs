import { Injectable } from '@nestjs/common';
import {
  ARG_NUM_DECORATOR,
  CONTENT_DECORATOR,
  CONTEXT_DECORATOR,
  USE_GUARDS_DECORATOR,
  USE_PIPES_DECORATOR,
} from '../constant/discord.constant';
import { DiscordParamDecoratorType } from '../interface/discord-param-decorator-type';
import { DecoratorParamType } from '../utils/enums/decorator-param-type';
import { DiscordGuard, DiscordPipeTransform } from '..';
import { ConstructorType } from '../utils/type/constructor-type';

@Injectable()
export class DiscordResolverService {
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
              const argsParamType = Reflect.getMetadata(
                'design:paramtypes',
                instance,
                methodName,
              );
              const paramType = argsParamType[item.parameterIndex];
              const content = argsData[0].content;
              if (typeof paramType === 'function') {
                return this.initContent(new paramType(), content);
              }
              return content;
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

  getPipeMetadata(
    instance: any,
    methodName: string,
  ): (DiscordPipeTransform | ConstructorType)[] {
    return Reflect.getMetadata(USE_PIPES_DECORATOR, instance, methodName);
  }

  getGuardMetadata(
    instance: any,
    methodName: string,
  ): (DiscordGuard | ConstructorType)[] {
    return Reflect.getMetadata(USE_GUARDS_DECORATOR, instance, methodName);
  }

  private initContent(instance: any, inputData: string) {
    const inputPart = inputData.split(' ');
    for (const propKey in instance) {
      const metadata = Reflect.getMetadata(
        ARG_NUM_DECORATOR,
        instance,
        propKey,
      );
      if (metadata) {
        instance[propKey] = inputPart[metadata.position];
      }
    }
    return instance;
  }
}
