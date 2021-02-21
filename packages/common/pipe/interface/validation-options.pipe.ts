import { ValidationError } from 'class-validator';
import { ValidatorOptions } from 'class-validator/types/validation/ValidatorOptions';
import { Message, MessageEmbed } from 'discord.js';

export interface ValidationOptionsPipe {
  /**
   * Class-validator options
   */
  validatorOptions?: ValidatorOptions;

  /**
   * Override default error message
   */
  exceptionFactory?: (errors: ValidationError[], context: Message) => MessageEmbed;
}