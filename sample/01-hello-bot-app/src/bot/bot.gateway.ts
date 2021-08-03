import { Injectable, Logger } from '@nestjs/common';
import {
  Content,
  Context,
  DiscordClientProvider,
  On,
  OnCommand,
  TransformPipe,
  UsePipes,
  UseGuards,
  Once,
  ValidationPipe,
} from 'discord-nestjs';
import { Message, MessageEmbed } from 'discord.js';
import { RegDto } from './dto/reg.dto';
import { DelDto } from './dto/del.dto';
import { AdminGuard } from './guard/admin.guard';
import { MessageDto } from './dto/message.dto';
import { ValidationError } from 'class-validator';

@Injectable()
export class BotGateway {
  private readonly logger = new Logger(BotGateway.name);
  private readonly users = []; // Only for example

  constructor(private readonly discordProvider: DiscordClientProvider) {}

  @Once({ event: 'ready' })
  async onReady(): Promise<void> {
    this.logger.log(
      `Logged in as ${this.discordProvider.getClient().user.tag}!`,
    );
  }

  @OnCommand({ name: 'hello' })
  async onHelloCommand(message: Message): Promise<void> {
    await message.reply(`Hello ${message.content}`);
  }

  @OnCommand({ name: 'reg' })
  @UsePipes(TransformPipe, ValidationPipe)
  async onRegCommand(
    @Content() content: RegDto,
    @Context() [context]: [Message],
  ): Promise<void> {
    this.users.push({
      id: context.author.id,
      name: content.name.join('-'),
      age: content.age,
    });
    await context.reply(
      `User was created! Id: ${context.author.id}, FIO: ${content.name.join(
        '-',
      )}, Age: ${content.age}`,
    );
  }

  @OnCommand({ name: 'del' })
  @UseGuards(AdminGuard)
  @UsePipes(
    TransformPipe,
    new ValidationPipe({
      exceptionFactory: (errors: ValidationError[], message: Message) =>
        new MessageEmbed().setTitle('Upss!').setDescription(message.content),
    }),
  )
  async onRemoveUser(
    @Content() content: DelDto,
    @Context() [context]: [Message],
  ): Promise<Message> {
    const userIndex = this.users.findIndex(
      (user) => user.id === context.author.id,
    );
    if (userIndex === -1) {
      return context.reply(`User with id ${content.user.id} not found!`);
    }
    this.users.splice(userIndex, 1);
    await context.reply(`User success deleted with id: ${content.user.id}!`);
  }

  @On({ event: 'message' })
  @UsePipes(TransformPipe)
  async omMessage(
    @Content() content: MessageDto,
    @Context() [context]: [Message],
  ): Promise<void> {
    if (!context.author.bot) {
      this.logger.log(`Income message with value: ${content.value}`);
    }
  }
}
