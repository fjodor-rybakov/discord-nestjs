import { Injectable } from '@nestjs/common';
import { ClassTransformOptions, plainToClass } from 'class-transformer';
import { ReflectMetadataProvider } from './reflect-metadata.provider';
import { ConstructorType } from '../util/type/constructor-type';
import { ArgRangeOptions } from '../decorator/interface/arg-range-options';
import { TransformParamResolver } from '../resolver/transform-param.resolver';
import { DiscordService } from '../service/discord.service';
import { TransformParamList } from '../resolver/interface/transform-param-list';
import { User } from 'discord.js';

@Injectable()
export class TransformProvider {
  constructor(
    private readonly metadataProvider: ReflectMetadataProvider,
    private readonly transformParamResolver: TransformParamResolver,
    private readonly discordService: DiscordService,
  ) {
  }

  async transformContent<T>(classType: ConstructorType<T>, inputData: string, options?: ClassTransformOptions): Promise<T> {
    if (!classType || !inputData) {
      return;
    }
    const newObj = {};
    const inputPart = inputData.split(' ');
    const paramData = this.transformParamResolver.getTransformParamByTarget(classType);
    for (const item of paramData) {
      if (item.argNum) {
        newObj[item.propertyKey] = this.getArgNumValue(inputPart, item);
      }
      if (item.argRange) {
        newObj[item.propertyKey] = this.getArgRangeValue(inputPart, item);
      }
    }
    const newClass = plainToClass(classType, newObj, options);
    await Promise.all(paramData.map(async (item) => {
      if (item.transformToUser && item.argNum) {
        newClass[item.propertyKey] = await this.getTransformValue(inputPart, item);
      }
    }));
    return newClass;
  }

  getArgPositions(target: any, propertyKey: string): ArgRangeOptions {
    const argData = this.transformParamResolver.getTransformParamByTargetAndProperty(target.constructor, propertyKey);
    if (argData) {
      if (argData.argNum) {
        return {formPosition: argData.argNum.position};
      }
      if (argData.argRange) {
        return {
          formPosition: argData.argRange.formPosition,
          toPosition: argData.argRange.toPosition
        };
      }
    }
  }

  private getCleanUserId(inputValue: string): string {
    return inputValue.split("").slice(3, inputValue.length - 1).join("");
  }

  private getArgNumValue(inputPart: string[], item: TransformParamList): string {
    return inputPart[item.argNum.position];
  }

  private getArgRangeValue(inputPart: string[], item: TransformParamList): string[] {
    item.argRange.toPosition = item.argRange.toPosition !== undefined ?
      item.argRange.toPosition : inputPart.length;
    return inputPart.slice(item.argRange.formPosition, item.argRange.toPosition);
  }

  private async getTransformValue(inputPart: string[], item: TransformParamList): Promise<User> {
    const userId = this.getCleanUserId(inputPart[item.argNum.position]);
    let user = this.discordService.getClient().users.cache.get(userId);
    if (!user) {
      user = await this.discordService.getClient().users.fetch(userId);
    }
    return user;
  }
}