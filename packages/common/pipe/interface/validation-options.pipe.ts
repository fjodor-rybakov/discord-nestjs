import { ValidationError } from 'class-validator';
import { ValidatorOptions } from 'class-validator/types/validation/ValidatorOptions';
import { MessageEmbed } from 'discord.js';

export interface ValidationOptionsPipe {
  validatorOptions?: ValidatorOptions;
  exceptionFactory?: (errors: ValidationError[], context: any) => MessageEmbed;
}