import { Field, TextInputValue } from '@discord-nestjs/core';
import { PartialTextInputData } from 'discord.js';

export class FormDto {
  @Field('Username')
  username: PartialTextInputData;

  @TextInputValue() // Custom id is optional. By default, will be used property name.
  comment: string;
}
