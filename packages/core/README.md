# Core module

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

#### 💡 Example

```typescript
/* registration.command.ts */

import { RegistrationDto } from './registration.dto';
import { Command } from '@discord-nestjs/core';
import { DiscordTransformedCommand } from '@discord-nestjs/core/src';
import { CommandInteraction } from 'discord.js';

@Command({
  name: 'reg',
  description: 'User registration',
})
export class BaseInfoCommand implements DiscordTransformedCommand<RegistrationDto>
{
  handler(dto: RegistrationDto, interaction: CommandInteraction): string {
    return `User was registered with name: ${dto.name}, age ${dto.age} and city ${dto.city}`;
  }
}
```

This is declared as follows:

```typescript
/* registration.dto.ts */

import { Arg, Choice, ArgType } from '@discord-nestjs/core';

enum City {
  Moscow,
  'New York',
  Tokyo,
}

export class RegistrationDto {
  @Arg({ description: 'User name', required: true })
  name: string;

  @Arg({ description: 'User old', required: true, type: ArgType.INTEGER })
  age: number;

  @Choice(City)
  @Arg({ description: 'User city', type: ArgType.INTEGER })
  city: City;
}
```

* `Arg` decorator defines command parameter.
* `Choice` decorator marks command parameter as dropdown(**Accepts enum**).

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

```typescript
/* email-sub-command.ts */

import { EmailDto } from '../../dto/email.dto';
import {
  Payload,
  SubCommand,
  DiscordTransformedCommand,
} from '@discord-nestjs/core';

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
} from '@discord-nestjs/core';

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