# Core module

## 🧾 Description

NestJS package for discord.js

- [👨🏻‍💻 Installation](#Installation)
- [📑 Overview](#Overview)
- [▶️ Usage](#Usage)
  - [ℹ️ Creating slash commands](#Command)
  - [ℹ️ UI based commands(Context menu commands)](#UIBasedCommand)
    - [ℹ️ Automatic registration of slash commands](#AutoRegCommand)
  - [ℹ️ Subscribe to event](#SubToEvent)
  - [ℹ️ Prefix commands](#PrefixCommands)
  - [ℹ️ Pipes](#Pipes)
  - [ℹ️ Guards](#Guards)
  - [ℹ️ Exception filters](#Filters)
  - [ℹ️ Collectors](#Collectors)
  - [ℹ️ Middleware](#MiddlewareUsage)
  - [ℹ️ Modals](#Modals)
- [🛠️ Exported providers](#Providers)
  - [ℹ️ DiscordClientProvider](#DiscordClientProvider)
  - [ℹ️ DiscordCommandProvider](#DiscordCommandProvider)
  - [ℹ️ ReflectMetadataProvider](#ReflectMetadataProvider)
- [🗂 Decorators description](#DecoratorsDescription)
  - [ℹ️ @InjectDiscordClient](#InjectDiscordClient)
  - [ℹ️ @Command](#Command)
  - [ℹ️ @SubCommand](#SubCommand)
  - [ℹ️ @On](#On)
  - [ℹ️ @Once](#Once)
  - [ℹ️ @PrefixCommand](#PrefixCommand)
  - [ℹ️ @ArgNum](#ArgNum)
  - [ℹ️ @ArgRange](#ArgRange)
  - [ℹ️ @Payload](#Payload)
  - [ℹ️ @UsePipes](#UsePipes)
  - [ℹ️ @UseGuards](#UseGuards)
  - [ℹ️ @UseFilters](#UseFilters)
  - [ℹ️ @Param](#Param)
  - [ℹ️ @Choice](#Choice)
  - [ℹ️ @Channel](#Channel)
  - [ℹ️ @Middleware](#Middleware)
  - [ℹ️ @InteractionEventCollector](#InteractionEventCollector)
  - [ℹ️ @MessageEventCollector](#MessageEventCollector)
  - [ℹ️ @ReactionEventCollector](#ReactionEventCollector)
  - [ℹ️ @UseCollectors](#UseCollectors)
  - [ℹ️ @InjectCollector](#InjectCollector)
  - [ℹ️ @Filter](#Filter)
  - [ℹ️ @Field](#Field)
  - [ℹ️ @TextInputValue](#TextInputValue)





## 👨🏻‍💻 Installation <a name="Installation"></a>

```bash
$ npm install @discord-nestjs/core discord.js
```

Or via yarn

```bash
$ yarn add @discord-nestjs/core discord.js
```





## 📑 Overview <a name="Overview"></a>

> ⚠️**Before you start using, set `useDefineForClassFields` to `true` in your `tsconfig.json`.**

The module declaration proceeds in the same way as it is done in NestJS by means
creating a dynamic module through the `forRootAsync` functions.

- `token` \* - Your discord bot token. You can get [here](https://discord.com/developers/applications)
- `discordClientOptions` \* - Client options from discord.js library
- `registerCommandOptions` - Specific registration of slash commands(If option is not set, global commands will be registered)
    - `forGuild` - For which guild to register a slash command
    - `trigger` - Used in cases where it is necessary to register commands by event
    - `allowFactory` - Based on what criteria will slash commands be registered
    - `removeCommandsBefore` - Remove mission commands
- `prefix` - Global command prefix
- `prefixGlobalOptions` - Global options for prefix command
- `webhook` - Connecting with webhook
    - `webhookId` \* - Webhook id
    - `webhookToken` \* - Webhook token
- `autoLogin` - Calling login function from discord client on application bootstrap
- `failOnLogin` - Throw an exception if login failed

> ⚠️**Important! For the bot to work correctly, you need to set up intentions in `discordClientOptions` param. [More info](https://discordjs.guide/popular-topics/intents.html#privileged-intents)**

Below is an example of creating a dynamic module using the `forRootAsync` function

```typescript
/* app.module.ts */

import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { GatewayIntentBits } from 'discord.js';

@Module({
  imports: [
    DiscordModule.forRootAsync({
      useFactory: () => ({
        token: 'your-bot-token',
        discordClientOptions: {
          intents: [Intents.FLAGS.GUILDS],
        },
      }),
    }),
  ],
})
export class AppModule {}
```

Alternatively, you can use the `useClass` syntax

```typescript
/* app.module.ts */

import { Module } from '@nestjs/common';
import { DiscordConfigService } from './discord-config-service';
import { DiscordModule } from '@discord-nestjs/core';

@Module({
  imports: [
    DiscordModule.forRootAsync({
      useClass: DiscordConfigService,
    }),
  ],
})
export class AppModule {}
```

You need to implement the `DiscordOptionsFactory` interface

```typescript
/* discord-config.service.ts */

import { Injectable } from '@nestjs/common';
import {
  DiscordModuleOption,
  DiscordOptionsFactory,
} from '@discord-nestjs/core';
import { GatewayIntentBits } from 'discord.js';

@Injectable()
export class DiscordConfigService implements DiscordOptionsFactory {
  createDiscordOptions(): DiscordModuleOption {
    return {
      token: 'your-bot-token',
      discordClientOptions: {
        intents: [Intents.FLAGS.GUILDS],
      },
    };
  }
}
```

If you need to inject exported providers outside the `AppModule`, use the `Discord.forFeature()` import.
For example, you need to get the Discord `Client` in your module.

```typescript
/* bot.module.ts */

import { Module } from '@nestjs/common';
import { DiscordModule } from '@discord-nestjs/core';
import { BotGateway } from './bot.gateway'

@Module({
  imports: [DiscordModule.forFeature()],
  providers: [BotGateway]
})
export class BotModule {}
```

```typescript
/* bot.gateway.ts */

import { Injectable, Logger } from '@nestjs/common';
import { Once, InjectDiscordClient } from '@discord-nestjs/core';
import { Client } from 'discord.js';

@Injectable()
export class BotGateway {
  private readonly logger = new Logger(BotGateway.name);

  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
  ) {}

  @Once('ready')
  onReady() {
    this.logger.log(`Bot ${this.client.user.tag} was started!`);
  }
}
```

## ▶️ Usage <a name="Usage"></a>

### ℹ️ Creating slash commands <a name="Command"></a>

> If you install `@angular-devkit/schematics-cli` and [@discord-nestjs/schematics](https://github.com/fjodor-rybakov/discord-nestjs/tree/master/packages/schematics)
> , you can run the follow command to create a slash-command bot template: 
> `schematics @discord-nestjs/schematics:application --template slash-command`

To add a slash command, you need to create a class that will implement the `DiscordCommand` interface and mark it with `@Command` decorator.
Command decorator accepts a `name` and `description` as parameters.

#### 💡 Example

```typescript
/* playlist.command.ts */

import { Command, DiscordCommand } from '@discord-nestjs/core';
import { CommandInteraction } from 'discord.js';
import { Injectable } from '@nestjs/common';

@Command({
  name: 'playlist',
  description: 'Get current playlist',
})
@Injectable()
export class PlaylistCommand implements DiscordCommand {
  handler(interaction: CommandInteraction): string {
    return 'List with music...';
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
import { Command, UsePipes, Payload, DiscordTransformedCommand } from '@discord-nestjs/core';
import { TransformPipe } from '@discord-nestjs/common';
import { Injectable } from '@nestjs/common';
import { CommandInteraction } from 'discord.js';

@Command({
  name: 'reg',
  description: 'User registration',
})
@Injectable()
@UsePipes(TransformPipe)
export class BaseInfoCommand implements DiscordTransformedCommand<RegistrationDto>
{
  handler(@Payload() dto: RegistrationDto, interaction: CommandInteraction): string {
    return `User was registered with name: ${dto.name}, age ${dto.age} and city ${dto.city}`;
  }
}
```

`DTO` is declared as follows:

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

  @Param({ description: 'User age', required: true, type: ParamType.INTEGER })
  age: number;

  @Choice(City)
  @Param({ description: 'User city', type: ParamType.INTEGER })
  city: City;
}
```

* `@Param` decorator defines command parameter.
* `@Choice` decorator marks command parameter as dropdown(**Accepts `enum` or `Map`**).
* `@Channel` decorator marks command parameter as channel select.

> By default, if `name` is not passed to the decorator parameters, 
> then the name of the marked property will be taken. 

> If the command parameter is a `string` or a `boolean`, then it is not necessary 
> to pass the type. The type will resolve **automatically**.

> You can also transform and validate the parameters to match your DTO by using the [common](https://github.com/fjodor-rybakov/discord-nestjs/tree/master/packages/common) package's 
> TransformPipe and ValidationPipe, or by using custom [Pipes](#Pipes).

Each command must be added to a NestJS module.

```typescript
/* bot-slash-commands.module.ts */

import { PlaylistCommand } from './playlist.command';
import { BaseInfoCommand } from './registration.command';
import { Module } from '@nestjs/common';

@Module({
  providers: [PlaylistCommand, BaseInfoCommand],
})
export class BotSlashCommands {
}
```

Or you can use https://github.com/fjodor-rybakov/nestjs-dynamic-providers for search files by glob pattern.

```typescript
/* bot-slash-commands.module.ts */

import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { InjectDynamicProviders } from 'nestjs-dynamic-providers';

@InjectDynamicProviders('**/*.command.js')
@Module({})
export class BotSlashCommands {}
```

And add your `BotSlashCommands` to `AppModule`.

```typescript
/* app.module.ts */

import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { GatewayIntentBits } from 'discord.js';
import { BotSlashCommands } from './bot-slash-commands.module';

@Module({
  imports: [
    DiscordModule.forRootAsync({
      useFactory: () => ({
        token: 'your-bot-token',
        discordClientOptions: {
          intents: [Intents.FLAGS.GUILDS],
        },
      }),
    }),
    BotSlashCommands,
  ],
})
export class AppModule {}
```

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

All commands and sub-commands must also be added to module providers.

```typescript
/* bot-slash-commands.module.ts */

import { RegistrationCommand } from './registration.command';
import { BaseInfoSubCommand } from './sub-commands/base-info-sub-command';
import { EmailSubCommand } from './sub-commands/email-sub-command';
import { NumberSubCommand } from './sub-commands/number-sub-command';
import { Module } from '@nestjs/common';

@Module({
  providers: [
    RegistrationCommand,
    NumberSubCommand,
    EmailSubCommand,
    BaseInfoSubCommand,
  ],
})
export class BotSlashCommands {
}
```

### ℹ️ UI based commands(Context menu commands) <a name="UIBasedCommand"></a>

In addition to slash commands, you can define commands through the context menu.
To do this, you need to explicitly set the command type. (`USER` or `MESSAGE`)

```typescript
/* playlist.command.ts */

import { Command, DiscordCommand } from '@discord-nestjs/core';
import { ContextMenuInteraction } from 'discord.js';
import { ApplicationCommandTypes } from 'discord.js/typings/enums';

@Command({
  name: 'playlist',
  type: ApplicationCommandTypes.USER,
})
export class PlaylistCommand implements DiscordCommand {
  handler(interaction: ContextMenuInteraction): string {
    return 'Your playlist...';
  }
}
```

### ℹ️ Automatic registration of slash commands <a name="AutoRegCommand"></a>

Commands are registered automatically if you define them in code. The `registerCommandOptions` property responds to the 
command registration setting. It works according to the following principle:

* `registerCommandOptions` - takes an array of objects.


* If `registerCommandOptions` option is not specified, global commands will be registered by default

* If `trigger` used in cases where it is necessary to register commands by event
* If `allowFactory` is specified then commands will be registered by condition from `allowFactory`
* If `forGuild` is specified, then commands for a specific guild will be registered
* If `removeCommandsBefore` is specified, then registered commands that are not in your code will be removed

The `trigger`, `allowFactory`, `forGuild` and `removeCommandsBefore` options are combined with each other.

> Global commands, unlike guild commands, are cached and updated once per hour. [More info](https://discordjs.guide/interactions/slash-commands.html#global-commands).

#### 💡 Example

```typescript
import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Intents, Message } from 'discord.js';
import { BotSlashCommands } from './bot-slash-commands.module';

@Module({
  imports: [
    DiscordModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        token: configService.get('TOKEN'),
        discordClientOptions: {
          intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
        },
        registerCommandOptions: [
          {
            forGuild: configService.get('GUILD_ID_WITH_COMMANDS'),
            allowFactory: (message: Message) =>
              !message.author.bot && message.content === '!deploy',
          },
        ],
      }),
      inject: [ConfigService],
    }),
    BotSlashCommands
  ],
})
export class BotModule {}
```

### ℹ️ Subscribe to event <a name="SubToEvent"></a>

Subscription to incoming events ([hint](https://gist.github.com/koad/316b265a91d933fd1b62dddfcc3ff584))

Use the `@On` decorator to subscribe to an event. `BotGateway` must be added to module providers.

#### 💡 Example

```typescript
/* bot.gateway.ts */

import { Injectable, Logger } from '@nestjs/common';
import { On, Once, InjectDiscordClient } from '@discord-nestjs/core';
import { Client, Message } from 'discord.js';

@Injectable()
export class BotGateway {
  private readonly logger = new Logger(BotGateway.name);

  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
  ) {}

  @Once('ready')
  onReady() {
    this.logger.log(`Bot ${this.client.user.tag} was started!`);
  }
  
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
import { Once } from '@discord-nestjs/core';
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

### ℹ️ Prefix commands <a name="PrefixCommands"></a>

> If you install `@angular-devkit/schematics-cli` and [@discord-nestjs/schematics](https://github.com/fjodor-rybakov/discord-nestjs/tree/master/packages/schematics)
> , you can run the follow command to create a prefix-command bot template:
> `schematics @discord-nestjs/schematics:application --template prefix-command`

To create a command with a prefix from the `messageCreate` event use the `@PrefixCommand` decorator.
The following code will create a `!start` prefix command.

#### 💡 Example

```typescript
/* bot.gateway.ts */

import {
  InjectDiscordClient,
  PrefixCommand,
  Once,
} from '@discord-nestjs/core';
import { Injectable, Logger } from '@nestjs/common';
import { Client } from 'discord.js';

@Injectable()
export class BotGateway {
  private readonly logger = new Logger(BotGateway.name);

  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
  ) {}

  @Once('ready')
  onReady() {
    this.logger.log(`Bot ${this.client.user.tag} was started!`);
  }

  @PrefixCommand('start', { prefix: '!' })
  async onMessage(message: Message): Promise<string> {
    return 'Message processed successfully';
  }
}
```

> You can set the `prefix` globally via setting in the `DiscordModule`.

You can also generate a DTO class based on incoming message content. 

Create an DTO class. Think of the input string as if it were separated by spaces.
For slicing parameters, the decorators `@ArgNum` and `@ArgRange` are used.

* `@ArgNum` takes value at array index 
* `@ArgRange` is the same as the `slice` function

#### 💡 Example

```typescript
/* start.dto.ts */

import { ArgNum, ArgRange } from '@discord-nestjs/core';

export class StartDto {
  @ArgNum(() => ({ position: 0 }))
  game: string;

  @ArgRange((last) => ({ formPosition: last + 1 }))
  players: string[];
}
```

Then just create a command. Mark the DTO with the `@Payload` decorator as the first parameter.
It is also necessary to hang a pipe that will create DTO. You can use the already built-in `PrefixCommandTransformPipe`
from the package `@discord/common` package or create your own pipe.

```typescript
/* bot.gateway.ts */

import { PrefixCommandTransformPipe } from '@discord-nestjs/common';
import {
  InjectDiscordClient,
  PrefixCommand,
  Once,
  Payload,
  UsePipes,
} from '@discord-nestjs/core';
import { Injectable, Logger } from '@nestjs/common';
import { Client, Message } from 'discord.js';

import { StartDto } from './dto/start.dto';

@Injectable()
export class BotGateway {
  private readonly logger = new Logger(BotGateway.name);

  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
  ) {}

  @Once('ready')
  onReady() {
    this.logger.log(`Bot ${this.client.user.tag} was started!`);
  }

  @PrefixCommand('start')
  @UsePipes(PrefixCommandTransformPipe)
  async onMessage(@Payload() dto: StartDto, message: Message): Promise<string> {
    console.log(dto);

    return 'Message processed successfully';
  }
}
```

`BotGateway` must be added to module providers.

The message `!start warzone misha mark` in the channel should generate 
`StartDto { game: 'warzone', players: [ 'misha', 'mark' ] }` DTO.


### ℹ️ Pipes <a name="Pipes"></a>

To intercept and transform messages before invoking the handler, use the `@UsePipes` decorator. Works with all event.
Pipes are often used for validation. For example `@discord-nestjs/common` package already has ready-made `ValidationPipe` template.

Pipes are executed sequentially from left to right.

> ⚠️**Import `@UsePipes` from the `@discord-nestjs/core` package**

You can create your custom pipe by implementing the `DiscordPipeTransform` interface.

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

> `@UsePipes` for slash commands are set only on the class

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

You can define pipe globally with `registerPipeGlobally()` function.

```typescript
/* app.module.ts */

import { DiscordModule, registerPipeGlobally } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GatewayIntentBits } from 'discord.js';
import { BotGateway } from './bot.gateway';
import { MyGlobalPipe } from './my-global-pipe';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DiscordModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        token: configService.get('TOKEN'),
        discordClientOptions: {
          intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
        },
        registerCommandOptions: [
          {
            forGuild: configService.get('GUILD_ID_WITH_COMMANDS'),
            removeCommandsBefore: true,
          },
        ],
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    BotGateway,
    {
      provide: registerPipeGlobally(),
      useClass: MyGlobalPipe,
    },
  ],
})
export class AppModule {}
```

> The `registerPipeGlobally()` function always generate a unique provider key, so you can define as many pipes as you want.

### ℹ️ Guards <a name="Guards"></a>

To protect commands and events, use. The `canActive` function returns boolean. If one of the guards returns false,
then the chain will stop there and the handler itself will not be called.

> `@UseGuards` for slash commands are set only on the class

For create guard you need to implement the `DiscordGuard` interface

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

And mark method or class with `@UseGuards` decorator

> ⚠️**Import `@UseGuards` from the `@discord-nestjs/core` package**

```typescript
/* bot.gateway.ts */

import { MessageFromUserGuard } from './guards/message-from-user.guard';
import { On, UseGuards } from '@discord-nestjs/core';
import { Injectable, Logger } from '@nestjs/common';
import { Message } from 'discord.js';

@Injectable()
export class BotGateway {
  private readonly logger = new Logger(BotGateway.name);

  @On('messageCreate')
  @UseGuards(MessageFromUserGuard)
  async onMessage(message: Message): Promise<void> {
    this.logger.log(`Incoming message: ${message.content}`);

    await message.reply('Message processed successfully');
  }
}
```

You can also set `@UseGuards` decorator on class. In this case, the decorator is applied to all methods in the class.
Excluding command classes.

You can define guard globally with `registerGuardGlobally()` function.

```typescript
/* app.module.ts */

import { DiscordModule, registerGuardGlobally } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GatewayIntentBits } from 'discord.js';
import { BotGateway } from './bot.gateway';
import { MyGlobalGuard } from './my-global-guard';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DiscordModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        token: configService.get('TOKEN'),
        discordClientOptions: {
          intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
        },
        registerCommandOptions: [
          {
            forGuild: configService.get('GUILD_ID_WITH_COMMANDS'),
            removeCommandsBefore: true,
          },
        ],
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    BotGateway,
    {
      provide: registerGuardGlobally(),
      useClass: MyGlobalGuard,
    },
  ],
})
export class AppModule {}
```

> The `registerGuardGlobally()` function always generate a unique provider key, so you can define as many guards as you want.

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
    const [interaction] = metadata.eventArgs;

    const embeds = exceptionList.map((exception) =>
      new MessageEmbed().setColor('RED').addFields(
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

> `@UseFilters` for slash commands are set only on the class

> ⚠️**Import `UseFilters` from the `@discord-nestjs/core` package**

```typescript
/* email-command.ts */

import { EmailDto } from '../../dto/email.dto';
import { CommandValidationFilter } from '../../filter/command-validation.filter';
import { TransformPipe, ValidationPipe } from '@discord-nestjs/common';
import {
  Payload,
  Command,
  DiscordTransformedCommand,
  UseFilters,
  UsePipes,
} from '@discord-nestjs/core';

@UseFilters(CommandValidationFilter)
@UsePipes(TransformPipe, ValidationPipe)
@Command({ name: 'email', description: 'Register by email' })
export class EmailCommand implements DiscordTransformedCommand<EmailDto> {
  handler(@Payload() dto: EmailDto): string {
    return `Success register user: ${dto.email}, ${dto.name}, ${dto.age}, ${dto.city}`;
  }
}
```

You can define filter globally with `registerFilterGlobally()` function.

```typescript
/* app.module.ts */

import { DiscordModule, registerFilterGlobally } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GatewayIntentBits } from 'discord.js';
import { EmailCommand } from './email-command';
import { MyGlobalFilter } from './my-global-filter';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DiscordModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        token: configService.get('TOKEN'),
        discordClientOptions: {
          intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
        },
        registerCommandOptions: [
          {
            forGuild: configService.get('GUILD_ID_WITH_COMMANDS'),
            removeCommandsBefore: true,
          },
        ],
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    EmailCommand,
    {
      provide: registerFilterGlobally(),
      useClass: MyGlobalFilter,
    },
  ],
})
export class AppModule {}
```

> The `registerFilterGlobally()` function always generate a unique provider key, so you can define as many filters as you want.

### ℹ️ Collectors <a name="Collectors"></a>

In addition to the standard implementation of `collectors` from `discord.js`, `discord-nestjs` provides their declaration 
through decorators. You can create three types of collectors: ReactCollector, MessageCollector and InteractionCollector.

The first thing you need to do is create a collector class and mark it with either `@MessageCollector` or 
`@ReactionEventCollector` or `@InteractionEventCollector` with a decorator. For example, let's create a `ReactionCollector`.

#### 💡 Example

```typescript
/* appreciated-reaction-collector.ts */

import {
  Filter,
  InjectCollector,
  On,
  Once,
  ReactionEventCollector,
} from '@discord-nestjs/core';
import { Injectable, Scope } from '@nestjs/common';
import { MessageReaction, ReactionCollector, User } from 'discord.js';

@Injectable({ scope: Scope.REQUEST })
@ReactionEventCollector({ time: 15000 })
export class AppreciatedReactionCollector {
  constructor(
    @InjectCollector()
    private readonly collector: ReactionCollector,
  ) {}

  @Filter()
  isLikeFromAuthor(reaction: MessageReaction, user: User): boolean {
    return (
      reaction.emoji.name === '👍' && user.id === reaction.message.author.id
    );
  }

  @On('collect')
  onCollect(): void {
    console.log('collect');
  }

  @Once('end')
  onEnd(): void {
    console.log('end');
  }
}
```

Let me explain in detail what is going on here.

* We marked the `AppreciatedReactionCollector` class with the `@ReactionEventCollector` decorator and passed collector 
  options as decorator argument. Think of it like we created `message.createReactionCollector({ time: 15000 });` from
  `discord.js` library.
* The `@InjectCollector` injects the value of the collector into the class constructor. 
If you use this decorator, you need to add `scope: Scope.REQUEST`. The default is `scope: Scope.DEFAULT`.
* The `@Filter` decorator filters the incoming data into the collector. Treat it like the `filter` option in `createReactionCollector`.
* Decorators `On` and `Once` subscribe to collector events.

> Filters, guards and pipes can be applied to collector events.

All collectors, guards, pipes and filters are created automatically in the module used.

To apply your collector to the message use `@UseCollectors` decorator.

#### 💡 Example

```typescript
/* bot.gateway.ts */

import { On, Once, UseCollectors, UseGuards } from '@discord-nestjs/core';
import { Injectable, Logger } from '@nestjs/common';
import { Message } from 'discord.js';

import { AppreciatedReactionCollector } from './appreciated-reaction-collector';
import { MessageFromUserGuard } from './guards/message-from-user.guard';

@Injectable()
export class BotGateway {
  private readonly logger = new Logger(BotGateway.name);

  @Once('ready')
  onReady(): void {
    this.logger.log('Bot was started!');
  }

  @On('messageCreate')
  @UseGuards(MessageFromUserGuard)
  @UseCollectors(AppreciatedReactionCollector)
  async onMessage(message: Message): Promise<void> {
    await message.reply('Start collector');
  }
}
```

Other collectors types are created exactly by analogy. They apply to both event handlers and commands.

For example, below is a sample button creation.

#### 💡 Example

```typescript
/* post-interaction-collector.ts */

import { InteractionEventCollector, On, Once } from '@discord-nestjs/core';
import { ButtonInteraction } from 'discord.js';

@InteractionEventCollector({ time: 15000 })
export class PostInteractionCollector {
  @On('collect')
  async onCollect(interaction: ButtonInteraction): Promise<void> {
    await interaction.update({
      content: 'A button was clicked!',
      components: [],
    });
  }
}
```

```typescript
/* play.command.ts */

import { TransformPipe } from '@discord-nestjs/common';
import {
  Command,
  DiscordTransformedCommand,
  Payload,
  UseCollectors,
  UsePipes,
} from '@discord-nestjs/core';
import {
  InteractionReplyOptions,
  MessageActionRow,
  MessageButton,
} from 'discord.js';

import { PlayDto } from '../dto/play.dto';
import { PostInteractionCollector } from '../post-interaction-collector';

@Command({
  name: 'play',
  description: 'Plays a song',
})
@UsePipes(TransformPipe)
@UseCollectors(PostInteractionCollector)
export class PlayCommand implements DiscordTransformedCommand<PlayDto> {
  async handler(@Payload() dto: PlayDto): Promise<InteractionReplyOptions> {
    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId('primary')
        .setLabel(dto.song)
        .setStyle('PRIMARY'),
    );

    return {
      content: 'Click on the button to play the song!',
      components: [row],
    };
  }
}
```

### ℹ️ Middleware <a name="MiddlewareUsage"></a>

You can use a middleware to process all incoming messages.
To do this, you need to implement the `DiscordMiddleware` interface.

#### 💡 Example

```typescript
/* bot.middleware.ts */

import { Middleware, DiscordMiddleware } from '@discord-nestjs/core';
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

### ℹ️ Modals <a name="Modals"></a>

Full example is shown [here](https://github.com/fjodor-rybakov/discord-nestjs/tree/master/packages/sample/modals)





## 🛠️ Exported providers <a name="Providers"></a>

`DiscordModule` currently exports only three providers.

### ℹ️ DiscordClientProvider <a name="DiscordClientProvider"></a>

Provides the discord client or webhook client.

### ℹ️ DiscordCommandProvider <a name="DiscordCommandProvider"></a>

`discord-nestjs` package builds slash command object based on all decorators and DiscordCommandProvider provides it.
For example, this is useful when you need to lazily register commands or register commands for a specific guild.

### ℹ️ ReflectMetadataProvider <a name="ReflectMetadataProvider"></a>

Provides methods for getting metadata for decorators.





## 🗂 Decorators description <a name="DecoratorsDescription"></a>

### ℹ️ @InjectDiscordClient <a name="InjectDiscordClient"></a>

Inject Discord.js client

### ℹ️ @Command <a name="Command"></a>

Mark class as command

#### Params

- `name` \* - Command name
- `description` \* - Command description
- `include` - Include subgroups and subcommands
- `defaultMemberPermissions` - Set default permission
- `dmPermission` - Has DM permission

### ℹ️ @SubCommand <a name="SubCommand"></a>

Mark class as subcommand

#### Params

- `name` \* - Command name
- `description` \* - Command description

### ℹ️ @On <a name="On"></a>

Handle discord and collector events [hint](https://gist.github.com/koad/316b265a91d933fd1b62dddfcc3ff584)

#### Params

`event` \* - Name of the event to listen to

### ℹ️ @Once <a name="Once"></a>

Handle discord and collector events (only once) [hint](https://gist.github.com/koad/316b265a91d933fd1b62dddfcc3ff584)

### ℹ️ @PrefixCommand <a name="PrefixCommand"></a>

Create prefix command

#### Params

`name` \* - Command name
`prefix` - Command prefix (If set, it overrides the global)
`isRemoveCommandName` - Remove command name from input string (Default `true`)
`isRemovePrefix` - Remove prefix from input string (Default `true`)
`isIgnoreBotMessage` - Ignore messages from bots (Default `true`)
`isRemoveMessage` - Remove message from channel after processing (Default `false`)

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
- `autocomplete` - Send autocomplete interaction(Only for `string`, `number` and `integer`)
- `minValue` - Min value for `number` or `integer`
- `maxValue` - Max value for `number` or `integer`
- `type` - Specifies the type of the parameter

### ℹ️ @Choice <a name="Choice"></a>

Marks command parameter as dropdown.

#### Params

(**Accepts `enum` or `Map`**)

### ℹ️ @Channel <a name="Channel"></a>

Marks command parameter as channel select.

#### Params

`channelType` - list of channel types

### ℹ️ @Middleware <a name="Middleware"></a>

For handling intermediate requests

#### Params

- `allowEvents` - Handled events
- `denyEvents` - Skipped events

### ℹ️ @InteractionEventCollector <a name="InteractionEventCollector"></a>

Create interaction collector

#### Params

See [here](https://discord.js.org/#/docs/main/stable/typedef/MessageComponentCollectorOptions)

### ℹ️ @MessageEventCollector <a name="MessageEventCollector"></a>

Create message collector

#### Params

See [here](https://discord.js.org/#/docs/main/stable/typedef/MessageCollectorOptions)

### ℹ️ @ReactionEventCollector <a name="ReactionEventCollector"></a>

Create reaction collector


#### Params

See [here](https://discord.js.org/#/docs/main/stable/typedef/ReactionCollectorOptions)

### ℹ️ @UseCollectors <a name="UseCollectors"></a>

Apply collector

#### Params

- List of collector classes

### ℹ️ @InjectCollector <a name="InjectCollector"></a>

Inject collector in constructor (only in class collector)

### ℹ️ @Filter <a name="Filter"></a>

Add filter to collector

### ℹ️ @Field <a name="Field"></a>

Extract field from modal form

### ℹ️ @TextInputValue <a name="TextInputValue"></a>

Extract text input value from modal form
