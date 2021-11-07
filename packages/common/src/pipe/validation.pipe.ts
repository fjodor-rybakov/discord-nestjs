import { DiscordPipeTransform } from '@discord-nestjs/core';
import { Injectable, Optional } from '@nestjs/common';
import { ValidatorOptions, validate } from 'class-validator';

/**
 * Validates DTO with class-validator
 */
@Injectable()
export class ValidationPipe implements DiscordPipeTransform {
  constructor(
    @Optional()
    private readonly validatorOptions?: ValidatorOptions,
  ) {}

  async transform(dtoInstance: any): Promise<any> {
    const result = await validate(dtoInstance, this.validatorOptions);

    if (result.length > 0) throw result;

    return dtoInstance;
  }
}
