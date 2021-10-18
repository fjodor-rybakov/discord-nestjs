import { DiscordPipeTransform } from '../../core';
import { ValidationPipeOptions } from './interfaces/validation-pipe-options';
import { Injectable, Optional } from '@nestjs/common';
import { validate } from 'class-validator';

@Injectable()
export class ValidationPipe implements DiscordPipeTransform {
  constructor(
    @Optional()
    private readonly validateOptions?: ValidationPipeOptions,
  ) {}

  async transform(dtoInstance: any): Promise<any> {
    const result = await validate(
      dtoInstance,
      this.validateOptions?.validatorOptions,
    );

    if (result.length > 0) {
      throw result;
    }

    return dtoInstance;
  }
}
