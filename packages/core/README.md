# Core module

## 🧾 Description

NestJS package for discord.js

- [Installation](#Installation)
- [Overview](#Overview)
- [Usage](#Usage)
  - [Creating slash commands](#Command)
  - [Subscribe to event](#SubToEvent)
  - [Pipes](#Pipes)
  - [Guards](#Guards)
  - [Exception filters](#Filters)
  - [Middleware](#MiddlewareUsage)
- [Decorators description](#DecoratorsDescription)
  - [@Command](#Command)
  - [@SubCommand](#SubCommand)
  - [@On](#On)
  - [@Once](#Once)
  - [@Payload](#Payload)
  - [@UsePipes](#UsePipes)
  - [@UseGuards](#UseGuards)
  - [@UseFilters](#UseFilters)
  - [@Param](#@Param)
  - [@Choice](#Choice)
  - [@Channel](#Channel)
  - [@Middleware](#Middleware)

## 👨🏻‍💻 Installation <a name="Installation"></a>

```bash
$ npm install @discord-nestjs/core discord.js
```

Or via yarn

```bash
$ yarn add @discord-nestjs/core discord.js
```

## 📑 Overview <a name="Overview"></a>

The module declaration proceeds in the same way as it is done in NestJS by means
creating a dynamic module through the `forRoot` and `forRootAsync` functions.

- `token` \* - Your discord bot token. You can get [here](https://discord.com/developers/applications)
- `discordClientOptions` \* - Client options from discord.js library
- `commands` - List of class types or list of search patterns
- `autoRegisterCommands` - Automatically register global commands in the Discord API
- `webhook` - Connecting with webhook
    - `webhookId` \* - Webhook id
    - `webhookToken` \* - Webhook token
- `useFilters` - List of filter exception that will apply to all handlers
- `usePipes` - List of pipes that will apply to all handlers
- `useGuards` - List of guards that will apply to all handlers

Below is an example of creating a dynamic module using the `forRoot` function

#### 💡 Example

```typescript
/* bot.module.ts */

import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Intents } from 'discord.js';

@Module({
  imports: [
    DiscordModule.forRoot({
      token: 'TOKEN',
      commands: ['**/*.command.js'],
      discordClientOptions: {
        intents: [Intents.FLAGS.GUILDS],
      },
    }),
  ],
})
export class BotModule {}
```

Or via the `forRootAsync` function

```typescript
/* bot.module.ts */

import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Intents } from 'discord.js';

@Module({
  imports: [
    DiscordModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        token: configService.get('TOKEN'),
        commands: ['**/*.command.js'],
        discordClientOptions: {
          intents: [Intents.FLAGS.GUILDS],
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class BotModule {}
```

Alternatively, you can use the `useClass` syntax

```typescript
/* bot.module.ts */

import { Module } from '@nestjs/common';
import { DiscordConfigService } from './discord-config-service';
import { DiscordModule } from '@discord-nestjs/core';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    DiscordModule.forRootAsync({
      imports: [ConfigModule],
      useClass: DiscordConfigService,
    }),
  ],
})
export class BotModule {}
```

You need to implement the `DiscordOptionsFactory` interface

```typescript
/* discord-config-service.ts */

import { Injectable } from '@nestjs/common';
import {
  DiscordModuleOption,
  DiscordOptionsFactory,
} from '@discord-nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Intents } from 'discord.js';

@Injectable()
export class DiscordConfigService implements DiscordOptionsFactory {
  constructor(
    private readonly configService: ConfigService
  ) {
  }

  createDiscordOptions(): DiscordModuleOption {
    return {
      token: this.configService.get('TOKEN'),
      commands: ['**/*.command.js'],
      discordClientOptions: {
        intents: [Intents.FLAGS.GUILDS],
      },
    };
  }
}
```

## ▶️ Usage <a name="Usage"></a>

### ℹ️ Creating slash commands <a name="Command"></a>

To add a slash command, you need to create a class that will implement the `DiscordCommand` interface and mark it with `@Command` decorator.
Command decorator accepts a `name` and `description` as parameters.

#### 💡 Example

```typescript
/* registration.command.ts */

import { Command } from '@discord-nestjs/core';
import { DiscordCommand } from '@discord-nestjs/core/src';
import { CommandInteraction } from 'discord.js';

@Command({
  name: 'name',
  description: 'Get user name',
})
export class RegistrationCommand implements DiscordCommand {
  handler(interaction: CommandInteraction): string {
    return interaction.user.username;
  }
}
```

If your command accepts parameters, you need to already implement the `DiscordTransformedCommand` interface.
The `handler` method of the `DiscordTransformedCommand` interface takes a DTO marked with `@Payload` decorator as the first parameter.

> ⚠️**Important! For fields to be filled in `DTO` from `CommandInteraction`, you must use `TransformPipe` from `@discord-nestjs/common`**

#### 💡 Example

```typescript
/* registration.command.ts */

import { RegistrationDto } from './registration.dto';
import { Command, UsePipes, Payload } from '@discord-nestjs/core';
import { TransformPipe } from '@discord-nestjs/common';
import { DiscordTransformedCommand } from '@discord-nestjs/core/src';
import { CommandInteraction } from 'discord.js';

@Command({
  name: 'reg',
  description: 'User registration',
})
@UsePipes(TransformPipe)
export class BaseInfoCommand implements DiscordTransformedCommand<RegistrationDto>
{
  handler(@Payload() dto: RegistrationDto, interaction: CommandInteraction): string {
    return `User was registered with name: ${dto.name}, age ${dto.age} and city ${dto.city}`;
  }
}
```

This is declared as follows:

```typescript
/* registration.dto.ts */

import { Param, Choice, ParamType } from '@discord-nestjs/core';

enum City {
  Moscow,
  'New York',
  Tokyo,
}

export class RegistrationDto {
  @Param({ description: 'User name', required: true })
  name: string;

  @Param({ description: 'User old', required: true, type: ParamType.INTEGER })
  age: number;

  @Choice(City)
  @Param({ description: 'User city', type: ParamType.INTEGER })
  city: City;
}
```

* `@Param` decorator defines command parameter.
* `@Choice` decorator marks command parameter as dropdown(**Accepts enum**).
* `@Channel` decorator marks command parameter as channel select.

> By default, if `name` is not passed to the decorator parameters, 
> then the name of the marked property will be taken. 

> If the command parameter is a `string` or a `number`, then it is not necessary 
> to pass the type. The type will resolve **automatically**.

If your command is more complex, you can add subgroups of commands or subcommands to it. 
To do this, you need to add your subgroups and subcommands to the `include` option. The `include` parameter accepts 
list of class types or `UseGroup` function, which in turn accepts group parameters and list of subcommands.

> ⚠️ **Remember that if you define a subgroups of commands or subcommands, this will automatically mark your main command unusable. 
> More details in [Discord API](https://canary.discord.com/developers/docs/interactions/slash-commands#subcommands-and-subcommand-groups)** 

#### 💡 Example

```typescript
/* registration.command.ts */

import { BaseInfoSubCommand } from './sub-commands/base-info-sub-command';
import { EmailSubCommand } from './sub-commands/email-sub-command';
import { NumberSubCommand } from './sub-commands/number-sub-command';
import { Command, UseGroup } from '@discord-nestjs/core';

@Command({
  name: 'reg',
  description: 'User registration',
  include: [
    UseGroup(
      { name: 'type', description: 'Registration type' },
      NumberSubCommand,
      EmailSubCommand,
    ),
    BaseInfoSubCommand,
  ],
})
export class RegistrationCommand {}
```

Subcommands are declared similarly to commands and implement the same interfaces.
To do this, you need to create a class, mark it with the `SubCommand` decorator and
specify which interface they implement(`DiscordCommand` or `DiscordTransformedCommand`)

#### 💡 Example

```typescript
/* email-sub-command.ts */

import { EmailDto } from '../../dto/email.dto';
import {
  Payload,
  SubCommand,
  DiscordTransformedCommand,
  UsePipes,
} from '@discord-nestjs/core';
import { TransformPipe } from '@discord-nestjs/common';

@UsePipes(TransformPipe)
@SubCommand({ name: 'email', description: 'Register by email' })
export class EmailSubCommand implements DiscordTransformedCommand<EmailDto> {
  handler(@Payload() dto: EmailDto): string {
    return `Success register user: ${dto.email}, ${dto.name}, ${dto.age}, ${dto.city}`;
  }
}
```

```typescript
/* number-sub-command.ts */

import { NumberDto } from '../../dto/number.dto';
import {
  DiscordTransformedCommand,
  Payload,
  SubCommand,
  UsePipes,
} from '@discord-nestjs/core';
import { TransformPipe } from '@discord-nestjs/common';

@UsePipes(TransformPipe)
@SubCommand({ name: 'number', description: 'Register by phone number' })
export class NumberSubCommand implements DiscordTransformedCommand<NumberDto> {
  handler(@Payload() dto: NumberDto): string {
    return `Success register user: ${dto.phoneNumber}, ${dto.name}, ${dto.age}, ${dto.city}`;
  }
}
```

```typescript
/* base-info-sub-command.ts */

import { DiscordCommand, SubCommand } from '@discord-nestjs/core';
import {
  CommandInteraction,
  InteractionReplyOptions,
  MessageEmbed,
} from 'discord.js';

@SubCommand({ name: 'base-info', description: 'Base info' })
export class BaseInfoSubCommand implements DiscordCommand {
  handler(interaction: CommandInteraction): InteractionReplyOptions {
    const { user } = interaction;

    const embed = new MessageEmbed()
      .setImage(user.avatarURL())
      .addField('Name', user.username);

    return {
      embeds: [embed],
    };
  }
}
```

### ℹ️ Subscribe to event <a name="SubToEvent"></a>

Subscription to incoming events ([hint](https://gist.github.com/koad/316b265a91d933fd1b62dddfcc3ff584))

Use the `@On` decorator to subscribe to an event. `BotGateway` must be added to providers.

#### 💡 Example

```typescript
/* bot.gateway.ts */

import { Injectable } from '@nestjs/common';
import { On } from 'discord-nestjs';
import { Message } from 'discord.js';

@Injectable()
export class BotGateway {
  @On('messageCreate')
  async onMessage(message: Message): Promise<void> {
    if (!message.author.bot) {
      await message.reply("I'm watching you");
    }
  }
}
```

You can also subscribe to an event once using the `@Once` decorator

#### 💡 Example

```typescript
/* bot.gateway.ts */

import { Injectable, Logger } from '@nestjs/common';
import { Once } from 'discord-nestjs';
import { Message } from 'discord.js';

@Injectable()
export class BotGateway {
  private readonly logger = new Logger(BotGateway.name);

  @Once('ready')
  onReady() {
    this.logger.log('Bot was started!');
  }
}
```

### ℹ️ Pipes <a name="Pipes"></a>

To intercept and transform messages before invoking the handler, use the `@UsePipes` decorator. Works with all event.
For convenience, the `@discord-nestjs/common` package already has an implementation of `TransformPipe` and `ValidationPipe`.

* `TransformPipe` - As mentioned above, transform pipe fills in the fields `DTO` from `CommandInteraction`
* `ValidationPipe` - Validates the resulting `DTO` from class-validator

You must attach the decorator `@UsePipes` to the handler or class and 
pass `TransformPipe` and `ValidationPipe` or your custom pipe to arguments.
Pipes are executed sequentially from left to right.

`@UsePipes` for slash commands are set only on the class

> ⚠️**Import `@UsePipes` from the `@discord-nestjs/core` package**

#### 💡 Example

```typescript
/* email-sub-command.ts */

import { EmailDto } from '../../dto/email.dto';
import { CommandValidationFilter } from '../../filter/command-validation.filter';
import { TransformPipe, ValidationPipe } from '@discord-nestjs/common';
import {
  Payload,
  SubCommand,
  DiscordTransformedCommand,
  UseFilters,
  UsePipes,
} from '@discord-nestjs/core';

@UsePipes(TransformPipe, ValidationPipe)
@SubCommand({ name: 'email', description: 'Register by email' })
export class EmailSubCommand implements DiscordTransformedCommand<EmailDto> {
  handler(@Payload() dto: EmailDto): string {
    return `Success register user: ${dto.email}, ${dto.name}, ${dto.age}, ${dto.city}`;
  }
}
```

You can also create your custom pipe by implementing the `DiscordPipeTransform` interface.

#### 💡 Example

```typescript
/* message-to-upper.pipe.ts */

import { DiscordPipeTransform } from '@discord-nestjs/core';
import { Message } from 'discord.js';

export class MessageToUpperPipe implements DiscordPipeTransform {
  transform([message]: [Message]): [Message] {
    message.content = message.content.toUpperCase();

    return [message];
  }
}
```

> For events, you must return an array of arguments that will be set to the handler

```typescript
/* bot.gateway.ts */

import { MessageToUpperPipe } from './pipes/message-to-upper.pipe';
import { On, UsePipes } from '@discord-nestjs/core';
import { Injectable, Logger } from '@nestjs/common';
import { Message } from 'discord.js';

@Injectable()
export class BotGateway {
  private readonly logger = new Logger(BotGateway.name);

  @On('messageCreate')
  @UsePipes(MessageToUpperPipe)
  async onMessage(message: Message): Promise<void> {
    if (message.author.bot) return;

    this.logger.log(`Incoming message: ${message.content}`);

    await message.reply('Message processed successfully');
  }
}
```

You can also set `@UsePipes` decorator on class. In this case, the decorator is applied to all methods in the class. 
Excluding command classes.

> You can define pipe globally by passing it as `usePipes` option in the module settings.

### ℹ️ Guards <a name="Guards"></a>

To protect commands and events, use. The `canActive` function returns boolean. If one of the guards returns false,
then the chain will stop there and the handler itself will not be called.

`@UseGuards` for slash commands are set only on the class

> ⚠️**Import `@UseGuards` from the `@discord-nestjs/core` package**

You need to implement the `DiscordGuard` interface

#### 💡 Example

```typescript
/* message-from-user.guard.ts */

import { DiscordGuard } from '@discord-nestjs/core';
import { Message } from 'discord.js';

export class MessageFromUserGuard implements DiscordGuard {
  canActive(event: 'messageCreate', [message]: [Message]): boolean {
    return !message.author.bot;
  }
}
```

```typescript
/* bot.gateway.ts */

import { MessageFromUserGuard } from './guards/message-from-user.guard';
import { MessageToUpperPipe } from './pipes/message-to-upper.pipe';
import { On, UsePipes, UseGuards } from '@discord-nestjs/core';
import { Injectable, Logger } from '@nestjs/common';
import { Message } from 'discord.js';

@Injectable()
export class BotGateway {
  private readonly logger = new Logger(BotGateway.name);

  @On('messageCreate')
  @UseGuards(MessageFromUserGuard)
  @UsePipes(MessageToUpperPipe)
  async onMessage(message: Message): Promise<void> {
    this.logger.log(`Incoming message: ${message.content}`);

    await message.reply('Message processed successfully');
  }
}
```

You can also set `@UseGuards` decorator on class. In this case, the decorator is applied to all methods in the class.
Excluding command classes.

> You can define guard globally by passing it as `useGuards` option in the module settings.

### ℹ️ Exception filters <a name="Filters"></a>

In order to catch exceptions in the handler of a command, event or pipe, you can use the exception filter.
Filters work in the same way as in the `NestJS` framework. The first thing you need to do is create a class that will 
implement the `DiscordExceptionFilter` interface and mark the class with `@Catch` decorator. `@Catch` decorator accepts a list of exception types.
If there are no parameters, then the filter will react to any exception.

> ⚠️**Import `DiscordExceptionFilter` and `@Catch` from the `@discord-nestjs/core` package**

#### 💡 Example

```typescript
/* command-validation-filter.ts */

import {
  DiscordArgumentMetadata,
  DiscordExceptionFilter,
  Catch,
} from '@discord-nestjs/core';
import { ValidationError } from 'class-validator';
import { MessageEmbed } from 'discord.js';

@Catch(ValidationError)
export class CommandValidationFilter implements DiscordExceptionFilter {
  async catch(
    exceptionList: ValidationError[],
    metadata: DiscordArgumentMetadata<'interactionCreate'>,
  ): Promise<void> {
    const [interaction] = metadata.context;

    const embeds = exceptionList.map((exception) =>
      new MessageEmbed().addFields(
        Object.values(exception.constraints).map((value) => ({
          name: exception.property,
          value,
        })),
      ),
    );

    if (interaction.isCommand()) await interaction.reply({ embeds });
  }
}
```

After that, you just need to pass the filter to `@UseFilters` decorator.

> ⚠️**Import `UseFilters` from the `@discord-nestjs/core` package**

```typescript
/* email-sub-command.ts */

import { EmailDto } from '../../dto/email.dto';
import { CommandValidationFilter } from '../../filter/command-validation.filter';
import { TransformPipe, ValidationPipe } from '@discord-nestjs/common';
import {
  Payload,
  SubCommand,
  DiscordTransformedCommand,
  UseFilters,
  UsePipes,
} from '@discord-nestjs/core';

@UseFilters(CommandValidationFilter)
@UsePipes(TransformPipe, ValidationPipe)
@SubCommand({ name: 'email', description: 'Register by email' })
export class EmailSubCommand implements DiscordTransformedCommand<EmailDto> {
  handler(@Payload() dto: EmailDto): string {
    return `Success register user: ${dto.email}, ${dto.name}, ${dto.age}, ${dto.city}`;
  }
}
```

> You can also define filter globally by passing it as `useFilters` option in the module settings.

### ℹ️ Middleware <a name="MiddlewareUsage"></a>

You can use a middleware to process all incoming messages.
To do this, you need to implement the `DiscordMiddleware` interface.

#### 💡 Example

```typescript
/* bot.middleware.ts */

import { Middleware, DiscordMiddleware } from 'discord-nestjs';
import { Logger } from '@nestjs/common';
import { ClientEvents } from 'discord.js';

@Middleware()
export class BotMiddleware implements DiscordMiddleware {
  private readonly logger = new Logger(BotMiddleware.name);

  use(event: keyof ClientEvents, context: any[]): void {
    if (event === 'message') {
      this.logger.log('On message event triggered');
    }
  }
}
```

Also don't forget to add your middleware to the providers.



## 🗂 Decorators description <a name="DecoratorsDescription"></a>

### ℹ️ @Command <a name="Command"></a>

Mark class as command

#### Params

- `name` \* - Command name
- `description` \* - Command description
- `include` - Include subgroups and subcommands
- `defaultPermission` - Set default permission

### ℹ️ @SubCommand <a name="SubCommand"></a>

Mark class as subcommand

#### Params

- `name` \* - Command name
- `description` \* - Command description

### ℹ️ @On <a name="On"></a>

Handle discord events [hint](https://gist.github.com/koad/316b265a91d933fd1b62dddfcc3ff584)

#### Params

`event` \* - Name of the event to listen to

### ℹ️ @Once <a name="Once"></a>

Handle discord events (only once) [hint](https://gist.github.com/koad/316b265a91d933fd1b62dddfcc3ff584)

#### Params

`event` \* - Name of the event to listen to

### ℹ️ @Payload <a name="Payload"></a>

Marks the parameter as DTO

### ℹ️ @UsePipes <a name="UsePipes"></a>

To intercept and transform incoming messages for some function

#### Params

- List of classes or instances that implement the `DiscordPipeTransform` interface

### ℹ️ @UseGuards <a name="UseGuards"></a>

To guard incoming messages

#### Params

- List of classes or instances that implement the `DiscordGuard` interface

### ℹ️ @UseFilters <a name="UseFilters"></a>

To catch exceptions from command handlers, events, pipes, guards and middleware

#### Params

- List of classes or instances that implement the `DiscordExceptionFilter` interface

### ℹ️ @Param <a name="Param"></a>

Sets the command parameter

#### Params

- `description` \* - Command description
- `name` - Command name
- `required` - The parameter is required
- `type` - Specifies the type of the parameter

### ℹ️ @Choice <a name="Choice"></a>

Marks command parameter as dropdown.

#### Params

(**Accepts enum**)

### ℹ️ @Channel <a name="Channel"></a>

Marks command parameter as channel select.

#### Params

`channelType` - list of channel types

### ℹ️ @Middleware <a name="Middleware"></a>

For handling intermediate requests

#### Params

- `allowEvents` - Handled events
- `denyEvents` - Skipped events
