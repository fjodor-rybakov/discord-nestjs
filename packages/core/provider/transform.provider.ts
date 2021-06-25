import { Injectable, Type } from '@nestjs/common';
import { ClassTransformOptions, plainToClass } from 'class-transformer';
import { ReflectMetadataProvider } from './reflect-metadata.provider';
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
  ) {}

  async transformContent<T>(
    classType: Type<T>,
    inputData: string,
    options?: ClassTransformOptions,
  ): Promise<T> {
    if (!classType || !inputData) {
      return;
    }
    const newObj = {};
    const inputPart = inputData.split(' ');
    const paramData =
      this.transformParamResolver.getTransformParamByTarget(classType);
    for (const item of paramData) {
      if (item.argNum) {
        newObj[item.propertyKey] = this.getArgNumValue(inputPart, item);
      }
      if (item.argRange) {
        newObj[item.propertyKey] = this.getArgRangeValue(inputPart, item);
      }
    }
    const newClass = plainToClass(classType, newObj, options);
    await Promise.all(
      paramData.map(async (item) => {
        if (item.transformToUser && item.argNum) {
          const argNumValue = this.getArgNumValue(inputPart, item);
          newClass[item.propertyKey] = await this.getTransformValue(
            argNumValue,
            item,
          );
        }
        if (item.transformToUser && item.argRange) {
          const argRangeValue = this.getArgRangeValue(inputPart, item);
          newClass[item.propertyKey] = await this.getTransformValueFromArray(
            argRangeValue,
            item,
          );
        }
      }),
    );
    return newClass;
  }

  getArgPositions(target: any, propertyKey: string): ArgRangeOptions {
    const argData =
      this.transformParamResolver.getTransformParamByTargetAndProperty(
        target.constructor,
        propertyKey,
      );
    if (argData) {
      if (argData.argNum) {
        return { formPosition: argData.argNum.position };
      }
      if (argData.argRange) {
        return {
          formPosition: argData.argRange.formPosition,
          toPosition: argData.argRange.toPosition,
        };
      }
    }
  }

  private getCleanUserId(inputValue: string): string {
    if (!inputValue) {
      return;
    }
    return inputValue
      .split('')
      .slice(3, inputValue.length - 1)
      .join('');
  }

  private getArgNumValue(
    inputPart: string[],
    item: TransformParamList,
  ): string {
    return inputPart[item.argNum.position];
  }

  private getArgRangeValue(
    inputPart: string[],
    item: TransformParamList,
  ): string[] {
    item.argRange.toPosition =
      item.argRange.toPosition !== undefined
        ? item.argRange.toPosition
        : inputPart.length;
    return inputPart.slice(
      item.argRange.formPosition,
      item.argRange.toPosition,
    );
  }

  private async getTransformValue(
    value: string,
    item: TransformParamList,
  ): Promise<User> {
    const userId = this.getCleanUserId(value);
    if (!userId) {
      return;
    }
    return this.findUser(userId, item);
  }

  private async getTransformValueFromArray(
    valueList: string[],
    item: TransformParamList,
  ): Promise<User[]> {
    const userIdList = valueList.map((value) => this.getCleanUserId(value));
    return Promise.all(
      userIdList.map((userId: string) => this.findUser(userId, item)),
    );
  }

  private async findUser(
    userId: string,
    item: TransformParamList,
  ): Promise<User> {
    try {
      let user = this.discordService.getClient().users.cache.get(userId);
      if (!user) {
        user = await this.discordService.getClient().users.fetch(userId);
      }
      return user;
    } catch (err) {
      if (item.transformToUser.throwError) {
        throw err;
      }
    }
  }
}
