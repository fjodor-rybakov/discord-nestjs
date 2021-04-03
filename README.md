<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

[travis-image]: https://api.travis-ci.org/nestjs/nest.svg?branch=master
[travis-url]: https://travis-ci.org/nestjs/nest
[linux-image]: https://img.shields.io/travis/nestjs/nest/master.svg?label=linux
[linux-url]: https://travis-ci.org/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="blank">Node.js</a> framework for building efficient and scalable server-side applications, heavily inspired by <a href="https://angular.io" target="blank">Angular</a>.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
  <a href="https://paypal.com/paypalme/fjodorrybakov"><img src="https://img.shields.io/badge/Donate-PayPal-dc3d53.svg"/></a>
  <a href="https://twitter.com/nestframework"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## 🧾 Description

NestJS package for discord.js

- [Installation](#Installation)
- [Overview](#Overview)
- [Usage](#Usage)
  - [Creating a handler for receiving messages by a bot](#OnCommand)
  - [Subscribe to event](#SubToEvent)
  - [Getting content and context through a decorator](#ContentContext)
  - [Pipes. Transformation and validation](#Pipes)
  - [Guards](#Guards)
  - [Middleware](#Middleware)
- [Decorators description](#DecoratorsDescription)
  - [@Client](#Client)
  - [@OnCommand](#OnCommand)
  - [@On](#On)
  - [@Once](#Once)
  - [@Content](#Content)
  - [@Context](#Context)
  - [@UsePipes](#UsePipes)
  - [@TransformToUser](#TransformToUser)
  - [@ArgNum](#ArgNum)
  - [@ArgRange](#ArgRange)
  - [@UseGuards](#UseGuards)
  - [@Middleware](#Middleware)

## 👨🏻‍💻 Installation <a name="Installation"></a>

```bash
$ npm install discord-nestjs discord.js
```

Or via yarn 

```bash
$ yarn add discord-nestjs discord.js
```

## 📑 Overview <a name="Overview"></a>

The module declaration proceeds in the same way as it is done in NestJS by means
creating a dynamic module through the `forRoot` and `forRootAsync` functions.

- `token` \* - Your discord bot token. You can get [here](https://discord.com/developers/applications)
- `commandPrefix` \* - Global prefix for command
- `allowGuilds` - List of Guild IDs that the bot is allowed to work with
- `denyGuilds` - List of Guild IDs that the bot is not allowed to work with
- `allowCommands` - Binding channels and user to a command. Can be overridden in the handler decorator
  - `name` \* - Command name
  - `channels` - List of channel IDs with which the command will work
  - `users` - List of user IDs with which the command will work
- `webhook` - Connecting with webhook
  - `webhookId` \* - Webhook id
  - `webhookToken` \* - Webhook token
- `usePipes` - List of pipes that will be applied to all handlers with the `@Content` decorator
  (with class type other than string type). Can be overridden via the `@UsePipes` decorator
- `useGuards` - A list of guards that will apply to all handlers.
  Can be overridden via the `@UseGuards` decorator
- You can also set all options as for the client from the "discord.js" library

⚠️**Import `TransformPipe` and `ValidationPipe` from `discord-nestjs` package**

Below is an example of creating a dynamic module using the `forRoot` function

#### 💡 Example

```typescript
/*bot.module.ts*/

import { Module } from '@nestjs/common';
import { DiscordModule, TransformPipe, ValidationPipe } from 'discord-nestjs';
import { BotGateway } from './bot-gateway';

@Module({
  imports: [
    DiscordModule.forRoot({
      token: 'Njg2MzI2OTMwNTg4NTY1NTQx.XmVlww.EF_bMXRvYgMUCQhg_jYnieoBW-k',
      commandPrefix: '!',
      allowGuilds: ['745366351929016363'],
      denyGuilds: ['520622812742811698'],
      allowCommands: [
        {
          name: 'some',
          channels: ['745366352386326572'],
          users: ['261863053329563648'],
          channelType: ['dm']
        },
      ],
      webhook: {
        webhookId: 'your_webhook_id',
        webhookToken: 'your_webhook_token',
      },
      usePipes: [TransformPipe, ValidationPipe],
      // and other discord options
    }),
  ],
  providers: [BotGateway],
})
export class BotModule {}
```

Or via the `forRootAsync` function

```typescript
/*bot.module.ts*/

import { Module } from '@nestjs/common';
import { DiscordModule, TransformPipe, ValidationPipe } from 'discord-nestjs';
import { BotGateway } from './bot-gateway';

@Module({
  imports: [
    DiscordModule.forRootAsync({
      useFactory: () => ({
        token: 'Njg2MzI2OTMwNTg4NTY1NTQx.XmVlww.EF_bMXRvYgMUCQhg_jYnieoBW-k',
        commandPrefix: '!',
        allowGuilds: ['745366351929016363'],
        denyGuilds: ['520622812742811698'],
        allowCommands: [
          {
            name: 'some',
            channels: ['745366352386326572'],
            users: ['261863053329563648'],
            channelType: ['dm']
          },
        ],
        webhook: {
          webhookId: 'your_webhook_id',
          webhookToken: 'your_webhook_token',
        },
        usePipes: [TransformPipe, ValidationPipe],
        // and other discord options
      }),
    }),
  ],
  providers: [BotGateway],
})
export class BotModule {}
```

Alternatively, you can use the `useClass` syntax

```typescript
/*bot.module.ts*/

import { Module } from '@nestjs/common';
import { DiscordConfigService } from './discord-config-service';
import { BotGateway } from './bot-gateway';
import { DiscordModule } from 'discord-nestjs';

@Module({
  imports: [
    DiscordModule.forRootAsync({
      useClass: DiscordConfigService
    }),
  ],
  providers: [BotGateway],
})
export class BotModule {}
```

You need to implement the `DiscordOptionsFactory` interface

```typescript
/*discord-config-service.ts*/

import { Injectable } from '@nestjs/common';
import { DiscordModuleOption, DiscordOptionsFactory, TransformPipe, ValidationPipe } from 'discord-nestjs';

@Injectable()
export class DiscordConfigService implements DiscordOptionsFactory {
  createDiscordOptions(): DiscordModuleOption {
    return {
      token: 'Njg2MzI2OTMwNTg4NTY1NTQx.XmVlww.EF_bMXRvYgMUCQhg_jYnieoBW-k',
      commandPrefix: '!',
      allowGuilds: ['745366351929016363'],
      denyGuilds: ['520622812742811698'],
      allowCommands: [
        {
          name: 'some',
          channels: ['745366352386326572'],
          users: ['261863053329563648'],
          channelType: ['dm']
        },
      ],
      webhook: {
        webhookId: 'your_webhook_id',
        webhookToken: 'your_webhook_token',
      },
      usePipes: [TransformPipe, ValidationPipe],
      // and other discord options
    }
  }
}
```

## ▶️ Usage <a name="Usage"></a>

Create a class (for example `BotGateway`) and mark it with the decorator `@Injectable` or `@Controller`.
You can get the client provider by adding a variable of type `DiscordClientProvider` to the dependency.
Below is an example of how you can notify yourself that a bot has successfully established a connection to the Discord API.

#### 💡 Example

```typescript
/*bot.gateway.ts*/

import { Injectable, Logger } from '@nestjs/common';
import { Once, DiscordClientProvider } from 'discord-nestjs';

@Injectable()
export class BotGateway {
  private readonly logger = new Logger(BotGateway.name);

  constructor(private readonly discordProvider: DiscordClientProvider) {}

  @Once({ event: 'ready' })
  onReady(): void {
    this.logger.log(`Logged in as ${this.discordProvider.getClient().user.tag}!`);
    this.discordProvider.getWebhookClient().send('hello bot is up!');
  }
}
```

You can also get the client provider using the `@Client` decorator.

#### 💡 Example

```typescript
/*bot.gateway.ts*/

import { Injectable, Logger } from '@nestjs/common';
import { Once, ClientProvider } from 'discord-nestjs';

@Injectable()
export class BotGateway {
  private readonly logger = new Logger(BotGateway.name);

  @Client()
  discordProvider: ClientProvider;

  @Once({ event: 'ready' })
  onReady(): void {
    this.logger.log(`Logged in as ${this.discordProvider.getClient().user.tag}!`);
  }
}
```

### ℹ️ Creating a handler for receiving messages by a bot <a name="OnCommand"></a>

Use the `@OnCommand` decorator to declare a command handler.

An example of creating a command is shown below. By default, the handler arguments will be the same as if 
you were signing up for an event in the "discord.js" library. ([hint](https://gist.github.com/koad/316b265a91d933fd1b62dddfcc3ff584))

The `OnCommand` decorator always subscribes to the "message" event

#### 💡 Example

```typescript
/*bot.gateway.ts*/

import { Injectable } from '@nestjs/common';
import { OnCommand } from 'discord-nestjs';
import { Message } from 'discord.js';

@Injectable()
export class BotGateway {
  @OnCommand({ name: 'start' })
  async onCommand(message: Message): Promise<void> {
    await message.reply(`Execute command: ${message.content}`);
  }
}
```

### ℹ️ Subscribe to event <a name="SubToEvent"></a>

Subscription to incoming events ([hint](https://gist.github.com/koad/316b265a91d933fd1b62dddfcc3ff584))

Use the `@On` decorator to subscribe to an event

#### 💡 Example

```typescript
/*bot.gateway.ts*/

import { Injectable } from '@nestjs/common';
import { On } from 'discord-nestjs';
import { Message } from 'discord.js';

@Injectable()
export class BotGateway {
  @On({ event: 'message' })
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
/*bot.gateway.ts*/

import { Injectable } from '@nestjs/common';
import { Once } from 'discord-nestjs';
import { Message } from 'discord.js';

@Injectable()
export class BotGateway {
  @Once({ event: 'message' })
  async onceMessage(message: Message): Promise<void> {
    if (!message.author.bot) {
      await message.reply("I'm watching you");
    }
  }
}
```

### ℹ️ Getting content and context through a decorator <a name="ContentContext"></a>

By default, the library sets the handler arguments on its own, as it was said [above](#SubToEvent),
but you can manipulate the arguments yourself using the `@Content` and `@Context` decorators

- Content - Message body (applicable only for "message" event)
- Context - Default handler arguments ([hint](https://gist.github.com/koad/316b265a91d933fd1b62dddfcc3ff584))

⚠️**Using decorators overrides the setting of arguments in the handler**

#### 💡 Example

```typescript
/*bot.gateway.ts*/

import { Content, Context, OnCommand } from 'discord-nestjs';
import { Injectable, Logger } from '@nestjs/common';
import { Message } from 'discord.js';

@Injectable()
export class BotGateway {
  private readonly logger = new Logger(BotGateway.name);

  @OnCommand({ name: 'start' })
  async onCommand(@Content() content: string, @Context() [context]: [Message]): Promise<void> {
    await context.reply(`Execute command: ${content}`, `Args: ${context}`);
  }
}
```

### ℹ️ Pipes. Transformation and validation <a name="Pipes"></a>

To intercept messages before invoking the handler, use the `@UsePipes` decorator.
Works only with the "message" event.
For convenience, the library already has an implementation of `TransformPipe` and `ValidationPipe`.

First thing you need to do is create a DTO class.
First, each field in the class must be marked with the `@Expose` decorator from the "class-transform" library,
secondly, it is necessary to mark how we will enter data into the variable.
Use the `@ArgNum` and `@ArgRange` decorators for markup.
`@ArgNum` takes the value at the index. Think of `@ArgRange` as a `slice` function for arrays.
Then you can add validation as you like.

⚠️**Import `@UsePipes, TransformPipe, ValidationPipe` from the `discord-nestjs` package**

#### 💡 Example

```typescript
/*registration.dto.ts*/

import { ArgNum, ArgRange } from 'discord-nestjs';
import { Expose } from 'class-transformer';
import { IsNumber, Min, IsArray } from 'class-validator';

export class RegistrationDto {
  @ArgRange(() => ({ formPosition: 1, toPosition: 4 }))
  @Expose()
  @IsArray()
  name: string[];

  @ArgNum((last: number) => ({ position: last }))
  @Expose()
  @Type(() => Number)
  @IsNumber()
  @Min(18)
  age: number;
}
```

After that we attach the decorator `@UsePipes` to the handler and pass `TransformPipe` and `ValidationPipe` to the arguments
in the same sequence.
Pipes are executed sequentially from left to right. The `@UsePipes` declaration overrides the global `usePipes` declaration.

#### 💡 Example

```typescript
/*bot.gateway.ts*/

import { UsePipes, Content, Context, OnCommand, TransformPipe, ValidationPipe } from 'discord-nestjs';
import { Injectable } from '@nestjs/common';
import { RegistrationDto } from './registration.dto';
import { Message } from 'discord.js';

@Injectable()
export class BotGateway {
  @OnCommand({name: 'reg'})
  @UsePipes(TransformPipe, ValidationPipe)
  async onSomeEvent(
    @Content() content: RegistrationDto,
    @Context() [context]: [Message]
  ): Promise<void> {
    await context.reply(
      `User was created! Id: ${context.author.id}, FIO: ${content.name.join('-')}, Age: ${content.age}`
    );
  }
}
```
```
Input:
!reg Ivan Ivanovich Ivanov 22
```
```
Output:
User was created!: Id: 261863053329563648, Ivan-Ivanovich-Ivanov, Age: 22
```

You can also set `@UsePipes` decorator on class. In this case, the decorator is applied to all methods in the class.

Transform alias to user class

#### 💡 Example

```typescript
/*user.dto.ts*/

import { ArgNum, TransformToUser } from 'discord-nestjs';
import { Expose } from 'class-transformer';
import { User } from 'discord.js';

export class UserDto {
  @ArgNum((last: number) => ({ position: 1 }))
  @Expose()
  @TransformToUser()
  user: User;
}
```
Create command handler

`TransformPipe` required for transform input string to DTO.
You can also use `ValidationPipe` for validate input

```typescript
/*bot.gateway.ts*/

import { Message } from 'discord.js';
import { Content, Context, OnCommand, UsePipes } from 'discord-nestjs';
import { UserDto } from './user.dto';
import { TransformPipe } from 'discord-nestjs';

@Injectable()
export class BotGateway {
  @OnCommand({ name: 'avatar' })
  @UsePipes(TransformPipe)
  async onCommand(@Content() content: UserDto, @Context() [context]: [Message]): Promise<void> {
    await context.reply(`User avatar: ${content.user.avatarURL()}`);
  }
}
```
```
Input:
!avatar @Федок
```
```
Output:
User avatar: https://cdn.discordapp.com/avatars/261863053329563648/d12c5a04be7bcabea7b9778b7e4fa6d5.webp
```

In order to override error handling in `ValidationPipe` you need to create an instance of the class manually.

#### 💡 Example

```typescript
/*bot.gateway.ts*/

import { UsePipes, Content, Context, OnCommand, TransformPipe, ValidationPipe } from 'discord-nestjs';
import { Injectable } from '@nestjs/common';
import { RegistrationDto } from './registration.dto';
import { Message, MessageEmbed } from 'discord.js';
import { ValidationError } from 'class-validator';

@Injectable()
export class BotGateway {
  @OnCommand({name: 'reg'})
  @UsePipes(TransformPipe, new ValidationPipe({
    exceptionFactory: (
      errors: ValidationError[], message: Message
    ) => new MessageEmbed().setTitle('Upss!').setDescription(message.content)
  }))
  async onSomeEvent(
    @Content() content: RegistrationDto,
    @Context() [context]: [Message]
  ): Promise<void> {
    await context.reply(
      `User was created! Id: ${context.author.id}, FIO: ${content.name.join('-')}, Age: ${content.age}`
    );
  }
}
```

You can also create your own `TransformPipe` or `ValidationPipe` by implementing the `DiscordPipeTransform` interface.

```typescript
/*transform.pipe.ts*/

import { TransformProvider, ConstructorType, ValidationPipe, DiscordPipeTransform } from 'discord-nestjs';
import { ClientEvents, Message } from 'discord.js';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TransformPipe implements DiscordPipeTransform {
  constructor(
    private readonly transformProvider: TransformProvider
  ) {
  }

  transform(
    event: keyof ClientEvents,
    [context]: [Message],
    content?: any,
    type?: ConstructorType<any>
  ): any {
    return this.transformProvider.transformContent(type, content);
  }
}
```

### ℹ️ Guards <a name="Guards"></a>

To protect commands and events, use. The `canActive` function returns boolean. If one of the guards returns false,
then the chain will stop there and the handler itself will not be called.
The `@UseGuards` declaration overrides the global `useGuards` declaration.

⚠️**Import `@UseGuards` from the `discord-nestjs` package**

You need to implement the `DiscordGuard` interface

#### 💡 Example

```typescript
/*bot.guard.ts*/

import { DiscordGuard } from 'discord-nestjs';
import { ClientEvents, MessageEmbed } from 'discord.js';

export class BotGuard implements DiscordGuard {
  async canActive(
    event: keyof ClientEvents,
    [context]: [any],
  ): Promise<boolean> {
    if (context.author.id === '766863033789563648') {
      return true;
    } else {
      const embed = new MessageEmbed().setColor().setTitle('Ups! Not allowed!');
      await context.reply(embed);
      return false;
    }
  }
}
```

```typescript
/*bot.gateway.ts*/

import { On, UseGuards, OnCommand } from 'discord-nestjs';
import { Message } from 'discord.js';
import { BotGuard } from './bot.guard';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BotGateway {
  @UseGuards(BotGuard)
  @OnCommand({ name: 'hide' })
  async guardCommand(message: Message): Promise<void> {
    // to do something
  }
}
```

You can also set `@UseGuards` decorator on class. In this case, the decorator is applied to all methods in the class.

### ℹ️ Middleware <a name="Middleware"></a>

You can use a middleware to process all incoming messages.
To do this, you need to implement the `DiscordMiddleware` interface.

#### 💡 Example

```typescript
/*bot.middleware.ts*/

import { Middleware, DiscordMiddleware } from 'discord-nestjs';
import { Logger } from '@nestjs/common';
import { ClientEvents } from 'discord.js';

@Middleware()
export class BotMiddleware implements DiscordMiddleware {
  private readonly logger = new Logger(BotMiddleware.name);

  use(
    event: keyof ClientEvents,
    context: any[],
  ): void {
    if (event === 'message') {
      this.logger.log('On message event triggered');
    }
  }
}
```

Also don't forget to add your middleware to the providers.

```typescript
@Module({
  providers: [BotMiddleware],
})
export class BotModule {}
```

## 🗂 Decorators description <a name="DecoratorsDescription"></a>

### ℹ️ @Client <a name="Client"></a>

Inject client provider

### ℹ️ @OnCommand <a name="OnCommand"></a>

Mark as command handler

#### Params

- `name` \* - Command name
- `prefix` - Command prefix (If set, it overrides the global)
- `isRemoveCommandName` - Remove command name from input string (Default `true`)
- `isRemovePrefix` - Remove prefix from input string (Default `true`)
- `isIgnoreBotMessage` - Ignore messages from bots (Default `true`)
- `allowChannels` - List of channel IDs with which the command will work (If set, it overrides the global)
- `isRemoveMessage` - Remove message from channel after processing (Default `false`)
- `allowUsers` - List of user IDs with which the command will work (If set, it overrides the global)
- `channelType` - Filter by text channel type (If set, it overrides the global)

### ℹ️ @On <a name="On"></a>

Handle discord events [hint](https://gist.github.com/koad/316b265a91d933fd1b62dddfcc3ff584)

#### Params

- `event` \* - Name of the event to listen to

### ℹ️ @Once <a name="Once"></a>

Handle discord events (only once) [hint](https://gist.github.com/koad/316b265a91d933fd1b62dddfcc3ff584)

#### Params

- `event` \* - Name of the event to listen to

### ℹ️ @Content <a name="Content"></a>

Message content (applicable only for "message" event)

### ℹ️ @Context <a name="Context"></a>

Default handler arguments ([hint](https://gist.github.com/koad/316b265a91d933fd1b62dddfcc3ff584))

### ℹ️ @UsePipes <a name="UsePipes"></a>

To intercept incoming messages for some function

#### Params

- List of classes or instances that implement the `DiscordPipeTransform` interface

### ℹ️ @TransformToUser <a name="TransformToUser"></a>

Transform alias to user class

Works only in conjunction with `@ArgNum` and `@ArgRange` decorator

#### Params

- `throwError` - If an error occurs from Discord APIm it will be thrown (Default `false`)

### ℹ️ @ArgNum <a name="ArgNum"></a>

Set value by argument number

#### Params

- arguments
  - `last` - Last index position
- return
  - `position` \* - Position index form input

### ℹ️ @ArgRange <a name="ArgRange"></a>

Set value by argument number

#### Params

- arguments
  - `last` - Last index position
- return
  - `formPosition` \* - Start index position form input
  - `toPosition` - Finish index position form input (default last index of input)

### ℹ️ @UseGuards <a name="UseGuards"></a>

To guard incoming messages

#### Params

- List of classes or instances that implement the `DiscordGuard` interface 

### ℹ️ @Middleware <a name="Middleware"></a>

For handling intermediate requests

#### Params

- `allowEvents` - Handled events
- `denyEvents` - Skipped events

Any questions or suggestions? Discord Федок#3051
