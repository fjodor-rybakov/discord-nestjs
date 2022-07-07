import { Field, TextInputValue } from '@discord-nestjs/core';
import { PartialTextInputData } from 'discord.js';

export class FormDto {
  @Field('Username')
  username: PartialTextInputData;

  @TextInputValue('Comment')
  comment: string;
}
