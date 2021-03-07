import { ClientEvents } from 'discord.js';
import { Injectable, Type } from '@nestjs/common';
import { DiscordPipeTransform, TransformProvider } from '../../core';

@Injectable()
export class TransformPipe implements DiscordPipeTransform {
  constructor(
    private readonly transformProvider: TransformProvider
  ) {
  }

  transform(event: keyof ClientEvents, context: any, content?: any, type?: Type): any {
    return this.transformProvider.transformContent(type, content);
  }
}