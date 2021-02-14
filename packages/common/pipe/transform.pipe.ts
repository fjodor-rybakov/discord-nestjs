import { ClientEvents } from 'discord.js';
import { Injectable } from '@nestjs/common';
import { ConstructorType, DiscordPipeTransform, TransformProvider } from '../../core';

@Injectable()
export class TransformPipe implements DiscordPipeTransform {
  constructor(
    private readonly transformProvider: TransformProvider
  ) {
  }

  transform(event: keyof ClientEvents, context: any, content?: any, type?: ConstructorType): any {
    return this.transformProvider.transformContent(type, content);
  }
}