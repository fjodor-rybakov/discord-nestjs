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
  - [ℹ️ Pipes, Guards, Interceptors and Filters](#Consumers)
  - [ℹ️ Collectors](#Collectors)
  - [ℹ️ Modals](#Modals)
- [🛠️ Exported providers](#Providers)
  - [ℹ️ DiscordClientProvider](#DiscordClientProvider)
  - [ℹ️ DiscordCommandProvider](#DiscordCommandProvider)
  - [ℹ️ ReflectMetadataProvider](#ReflectMetadataProvider)
  - [ℹ️ CollectorProvider](#CollectorProvider)
- [🗂 Decorators description](#DecoratorsDescription)
  - [ℹ️ @InjectDiscordClient](#InjectDiscordClient)
  - [ℹ️ @Command](#Command)
  - [ℹ️ @SubCommand](#SubCommand)
  - [ℹ️ @On](#On)
  - [ℹ️ @Once](#Once)
  - [ℹ️ @ArgNum](#ArgNum)
  - [ℹ️ @ArgRange](#ArgRange)
  - [ℹ️ @InteractionEvent/@IA](#InteractionEvent)
  - [ℹ️ @InteractionEvent/@MSG](#MessageEvent)
  - [ℹ️ @Param](#Param)
  - [ℹ️ @Choice](#Choice)
  - [ℹ️ @Channel](#Channel)
  - [ℹ️ @InteractionEventCollector](#InteractionEventCollector)
  - [ℹ️ @MessageEventCollector](#MessageEventCollector)
  - [ℹ️ @ReactionEventCollector](#ReactionEventCollector)
  - [ℹ️ @UseCollectors](#UseCollectors)
  - [ℹ️ @InjectCollector](#InjectCollector)
  - [ℹ️ @InjectCauseEvent](#InjectCauseEvent)
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
          intents: [GatewayIntentBits.Guilds],
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
        intents: [GatewayIntentBits.Guilds],
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

To add a slash command, you need to create a class with `@Command` decorator.
The `@Handler` decorator will point to the command processing method.

#### 💡 Example

```typescript
/* playlist.command.ts */

import { Command, Handler } from '@discord-nestjs/core';
import { CommandInteraction } from 'discord.js';
import { Injectable } from '@nestjs/common';

@Command({
  name: 'playlist',
  description: 'Get current playlist',
})
@Injectable()
export class PlaylistCommand {
  @Handler() 
  onPlaylist(interaction: CommandInteraction): string {
    return 'List with music...';
  }
}
```

If your command accepts parameters, you need to create a class with options.

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

To get object with command option you need add `@InteractionEvent()`/`@IA()` with `SlashCommandPipe`.
`InteractionEvent` will extract the data from event args and `SlashCommandPipe` will convert the data into an object.

> You can import `SlashCommandPipe` from [common](https://github.com/fjodor-rybakov/discord-nestjs/tree/master/packages/common) package

#### 💡 Example

```typescript
/* registration.command.ts */

import {Command, InteractionEvent, Handler} from '@discord-nestjs/core';
import {SlashCommandPipe} from '@discord-nestjs/common';
import {Injectable} from '@nestjs/common';

import {RegistrationDto} from './registration.dto';

@Command({
  name: 'reg',
  description: 'User registration',
})
@Injectable()
export class BaseInfoCommand {
  @Handler()
  onRegistration(@InteractionEvent(SlashCommandPipe) options: RegistrationDto): string {
    return `User was registered with name: ${options.name}, age ${options.age} and city ${options.city}`;
  }
}
```

> Also, you can validate the options using `ValidationPipe` from [common](https://github.com/fjodor-rybakov/discord-nestjs/tree/master/packages/common) package.

Each command must be added to a NestJS module.

```typescript
/* bot-slash-commands.module.ts */

import { PlaylistCommand } from './playlist.command';
import { BaseInfoCommand } from './registration.command';
import { Module } from '@nestjs/common';

@Module({
  providers: [PlaylistCommand, BaseInfoCommand],
})
export class BotSlashCommandsModule {
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
export class BotSlashCommandsModule {}
```

And add your `BotSlashCommandsModule` to `AppModule`.

```typescript
/* app.module.ts */

import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { GatewayIntentBits } from 'discord.js';
import { BotSlashCommandsModule } from './bot-slash-commands.module';

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
    BotSlashCommandsModule,
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

import {
  Handler,
  IA,
  SubCommand,
} from '@discord-nestjs/core';
import {SlashCommandPipe} from '@discord-nestjs/common';

import {EmailDto} from '../../dto/email.dto';

@SubCommand({name: 'email', description: 'Register by email'})
export class EmailSubCommand {
  @Handler()
  onEmail(@IA(SlashCommandPipe) dto: EmailDto): string {
    return `Success register user: ${dto.email}, ${dto.name}, ${dto.age}, ${dto.city}`;
  }
}
```

```typescript
/* number-sub-command.ts */

import {
  Handler,
  IA,
  SubCommand,
} from '@discord-nestjs/core';
import {SlashCommandPipe} from '@discord-nestjs/common';

import {NumberDto} from '../../dto/number.dto';

@SubCommand({name: 'number', description: 'Register by phone number'})
export class NumberSubCommand {
  @Handler()
  onPhoneNumber(@IA(SlashCommandPipe) dto: NumberDto): string {
    return `Success register user: ${dto.phoneNumber}, ${dto.name}, ${dto.age}, ${dto.city}`;
  }
}
```

```typescript
/* base-info-sub-command.ts */

import {Handler, SubCommand} from '@discord-nestjs/core';
import {
  CommandInteraction,
  InteractionReplyOptions,
  MessageEmbed,
} from 'discord.js';

@SubCommand({name: 'base-info', description: 'Base info'})
export class BaseInfoSubCommand {
  @Handler()
  onBaseInfo(interaction: CommandInteraction): InteractionReplyOptions {
    const {user} = interaction;

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
export class BotSlashCommandsModule {
}
```

### ℹ️ UI based commands(Context menu commands) <a name="UIBasedCommand"></a>

In addition to slash commands, you can define commands through the context menu.
To do this, you need to explicitly set the command type. (`USER` or `MESSAGE`)

```typescript
/* playlist.command.ts */

import {Command, Handler} from '@discord-nestjs/core';
import {ContextMenuInteraction} from 'discord.js';
import {ApplicationCommandTypes} from 'discord.js/typings/enums';

@Command({
  name: 'playlist',
  type: ApplicationCommandTypes.USER,
})
export class PlaylistCommand {
  @Handler()
  onPlaylist(interaction: ContextMenuInteraction): string {
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

> Global commands, unlike guild commands, are cached and updated once per hour. [More info](https://discordjs.guide/creating-your-bot/command-deployment.html#global-commands).

#### 💡 Example

```typescript
import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GatewayIntentBits, Message } from 'discord.js';
import { BotSlashCommandsModule } from './bot-slash-commands.module';

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
    BotSlashCommandsModule
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

To create a command with a prefix from the `messageCreate` event use the `PrefixCommandInterceptor`.
The following code will create a `!start` prefix command.

#### 💡 Example

```typescript
/* bot.gateway.ts */

import {PrefixCommandInterceptor} from '@discord-nestjs/common';
import {
    InjectDiscordClient,
    On,
    Once,
} from '@discord-nestjs/core';
import { Injectable, Logger, UseInterceptors } from '@nestjs/common';
import { Client } from 'discord.js';

import { StartDto } from './dto/start.dto';

@Injectable()
export class BotGateway {
  private readonly logger = new Logger(BotGateway.name);

  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
  ) {}

  @Once('ready')
  onReady(): void {
    this.logger.log(`Bot ${this.client.user.tag} was started!`);
  }

  @On('messageCreate')
  @UseInterceptors(new PrefixCommandInterceptor('start'))
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

Then just create a command. To get object with command option you need add `@MessageEvent()`/`@MSG()` with `PrefixCommandPipe`.
`MessageEvent` will extract the data from event args and `PrefixCommandPipe` will convert the data into an object.

> You can import `PrefixCommandPipe` from [common](https://github.com/fjodor-rybakov/discord-nestjs/tree/master/packages/common) package

```typescript
/* bot.gateway.ts */

import {PrefixCommandInterceptor, PrefixCommandPipe} from '@discord-nestjs/common';
import {
  InjectDiscordClient,
  On,
  Once,
  MessageEvent
} from '@discord-nestjs/core';
import { Injectable, Logger, UseInterceptors } from '@nestjs/common';
import { Client } from 'discord.js';

import {StartDto} from './dto/start.dto';

@Injectable()
export class BotGateway {
  private readonly logger = new Logger(BotGateway.name);

  constructor(
    @InjectDiscordClient()
    private readonly client: Client,
  ) {
  }

  @Once('ready')
  onReady() {
    this.logger.log(`Bot ${this.client.user.tag} was started!`);
  }

  @On('messageCreate')
  @UseInterceptors(new PrefixCommandInterceptor('start'))
  async onMessage(@MessageEvent(PrefixCommandPipe) dto: StartDto): Promise<string> {
    console.log(dto);

    return 'Message processed successfully';
  }
}
```

`BotGateway` must be added to module providers.

The message `!start warzone misha mark` in the channel should generate 
`StartDto { game: 'warzone', players: [ 'misha', 'mark' ] }` DTO.


### ℹ️ Pipes, Guards, Interceptors and Filters <a name="Consumers"></a>

[Pipes](https://docs.nestjs.com/pipes), [Guards](https://docs.nestjs.com/guards), [Interceptors](https://docs.nestjs.com/interceptors)
and [Filter](https://docs.nestjs.com/exception-filters) work the same as Nest.

The only exception is guard. In NestJS `Guard` consumer throw Forbidden exception, when access denied. 
The `discord-nestjs` listeners catch `ForbiddenException` by default. To override this behavior set 
`isTrowForbiddenException: true` in `DiscordModule` options.

### ℹ️ Collectors <a name="Collectors"></a>

In addition to the standard implementation of `collectors` from `discord.js`, `discord-nestjs` provides their declaration 
through decorators. You can create three types of collectors: ReactCollector, MessageCollector and InteractionCollector.

The first thing you need to do is create a collector class and mark it with either `@MessageEventCollector` or 
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

> Filters, guards, interceptors and pipes can be applied to collector events.

To apply your collector to the message use `@UseCollectors` decorator.

#### 💡 Example

```typescript
/* bot.gateway.ts */

import { On, Once, UseCollectors } from '@discord-nestjs/core';
import { CollectorInterceptor } from '@discord-nestjs/common';
import { Injectable, Logger, UseGuards, UseInterceptors } from '@nestjs/common';
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
  @UseInterceptors(CollectorInterceptor)
  async onMessage(message: Message): Promise<void> {
    await message.reply('Start collector');
  }
}
```

In order for the collector to be called in the correct order, you need to hang `CollectorInterceptor` interceptor.

> You can import `CollectorInterceptor` from [common](https://github.com/fjodor-rybakov/discord-nestjs/tree/master/packages/common) package

If you need to get applied collectors use `@AppliedCollectors` param decorator.

Other collectors types are created exactly by analogy. They apply to both event handlers and commands.

For example, below is a sample button creation.

#### 💡 Example

```typescript
/* post-interaction-collector.ts */

import {
  Filter,
  InjectCauseEvent,
  InteractionEventCollector,
  On,
} from '@discord-nestjs/core';
import { Injectable, Scope } from '@nestjs/common';
import { ButtonInteraction, ChatInputCommandInteraction } from 'discord.js';

@Injectable({ scope: Scope.REQUEST })
@InteractionEventCollector({ time: 15000 })
export class PostInteractionCollector {
  constructor(
    @InjectCauseEvent()
    private readonly causeInteraction: ChatInputCommandInteraction,
  ) {}

  @Filter()
  filter(interaction: ButtonInteraction): boolean {
    return this.causeInteraction.id === interaction.message.interaction.id;
  }

  @On('collect')
  async onCollect(interaction: ButtonInteraction): Promise<void> {
    await interaction.update({
      content: 'A button was clicked!',
      components: [],
    });
  }
}

```

* The `@InjectCauseEvent` decorator allow you get event that created the collector

```typescript
/* play.command.ts */

import { CollectorInterceptor, SlashCommandPipe } from '@discord-nestjs/common';
import {
  AppliedCollectors,
  Command,
  Handler,
  IA,
  UseCollectors,
} from '@discord-nestjs/core';
import { MessageActionRowComponentBuilder } from '@discordjs/builders';
import { UseInterceptors } from '@nestjs/common';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  InteractionCollector,
  InteractionReplyOptions,
} from 'discord.js';

import { PlayDto } from '../dto/play.dto';
import { PostInteractionCollector } from '../post-interaction-collector';

@Command({
  name: 'play',
  description: 'Plays a song',
})
@UseInterceptors(CollectorInterceptor)
@UseCollectors(PostInteractionCollector)
export class PlayCommand {
  @Handler()
  async onPlayCommand(
    @IA(SlashCommandPipe) dto: PlayDto,
    @AppliedCollectors(0) collector: InteractionCollector<ButtonInteraction>,
  ): Promise<InteractionReplyOptions> {
    const row =
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId('primary')
          .setLabel(dto.song)
          .setStyle(ButtonStyle.Primary),
      );

    console.log(collector);

    return {
      content: 'Click on the button to play the song!',
      components: [row],
    };
  }
}
```

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

### ℹ️ CollectorProvider <a name="CollectorProvider"></a>

Allow you to apply collector event




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

### ℹ️ @InteractionEvent/@IA <a name="InteractionEvent"></a>

Extract interaction event from args

### ℹ️ @MessageEvent/@MSG <a name="MessageEvent"></a>

Extract message event from args

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

### ℹ️ @InjectCauseEvent <a name="InjectCauseEvent"></a>

Inject cause event in constructor (only in class collector)

### ℹ️ @Filter <a name="Filter"></a>

Add filter to collector

### ℹ️ @Field <a name="Field"></a>

Extract field from modal form

### ℹ️ @TextInputValue <a name="TextInputValue"></a>

Extract text input value from modal form
