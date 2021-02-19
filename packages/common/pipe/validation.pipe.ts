import { ConstructorType, DiscordPipeTransform } from '../../core';
import { ClientEvents } from 'discord.js';
import { Injectable, Optional } from '@nestjs/common';
import { ValidationOptionsPipe } from './interface/validation-options.pipe';
import { validate } from 'class-validator';

@Injectable()
export class ValidationPipe implements DiscordPipeTransform {
  private readonly validateOptions: ValidationOptionsPipe;

  constructor(
    @Optional() options?: ValidationOptionsPipe
  ) {
    this.validateOptions = options;
  }

  async transform(event: keyof ClientEvents, context: any, content?: any, type?: ConstructorType): Promise<any> {
    const result = await validate(content, this.validateOptions?.validatorOptions);
    if (result.length > 0) {
      throw result;
    }
    return content;
  }


}