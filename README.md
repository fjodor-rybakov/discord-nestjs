<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

[travis-image]: https://api.travis-ci.org/nestjs/nest.svg?branch=master
[travis-url]: https://travis-ci.org/nestjs/nest
[linux-image]: https://img.shields.io/travis/nestjs/nest/master.svg?label=linux
[linux-url]: https://travis-ci.org/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="blank">Node.js</a> framework for building efficient and scalable server-side applications, heavily inspired by <a href="https://angular.io" target="blank">Angular</a>.</p>
    <p align="center">
<a href="https://github.com/fjodor-rybakov/discord-nestjs/blob/master/LICENSE"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
  <a href="https://paypal.com/paypalme/fjodorrybakov"><img src="https://img.shields.io/badge/Donate-PayPal-dc3d53.svg"/></a>
</p>



## 👨🏻‍💻 Installation <a name="Installation"></a>

```bash
$ npm install @discord-nestjs/core discord.js
```

Or via yarn

```bash
$ yarn add @discord-nestjs/core discord.js
```



## 🧾 Description

NestJS package for discord.js

This monorepo consists of several packages.
* [@discord-nestjs/core](https://github.com/fjodor-rybakov/discord-nestjs/tree/master/packages/core) - Main package containing decorators, basic types and module declaration.
* [@discord-nestjs/common](https://github.com/fjodor-rybakov/discord-nestjs/tree/master/packages/common) - Contains optional common templates. For example TransformPipe or ValidationPipe.
* Samples
  * [@discord-nestjs/sample-command](https://github.com/fjodor-rybakov/discord-nestjs/tree/master/packages/sample/command) - Bot example with slash commands
  * [@discord-nestjs/sample-sub-command](https://github.com/fjodor-rybakov/discord-nestjs/tree/master/packages/sample/sub-command) - Bot example with slash sub-commands and sub-groups
  * [@discord-nestjs/sample-validation](https://github.com/fjodor-rybakov/discord-nestjs/tree/master/packages/sample/validation) - Bot example with slash commands validation
  * [@discord-nestjs/sample-event](https://github.com/fjodor-rybakov/discord-nestjs/tree/master/packages/sample/event) - Bot example with events
  * [@discord-nestjs/sample-dependency-injection](https://github.com/fjodor-rybakov/discord-nestjs/tree/master/packages/sample/dependency-injection) - Bot example with dependency injection
  * [@discord-nestjs/sample-reaction-collector](https://github.com/fjodor-rybakov/discord-nestjs/tree/master/packages/sample/reaction-collector) - Bot example with reaction collector
  * [@discord-nestjs/sample-message-collector](https://github.com/fjodor-rybakov/discord-nestjs/tree/master/packages/sample/message-collector) - Bot example with message collector
  * [@discord-nestjs/sample-interaction-collector](https://github.com/fjodor-rybakov/discord-nestjs/tree/master/packages/sample/interaction-collector) - Bot example with interaction collector
  * [@discord-nestjs/prefix-command](https://github.com/fjodor-rybakov/discord-nestjs/tree/master/packages/sample/prefix-command) - Bot example with prefix command



## ❓ Answers on questions

### How to migrate from v2 to v3

<details>
  <summary>Click to expand</summary>

#### Modules

For ease of understanding, move your bot declarations to the root module(AppModule).

```typescript
/* app.module.ts */

import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Intents } from 'discord.js';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DiscordModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        token: configService.get('TOKEN'),
        discordClientOptions: {
          intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
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
})
export class AppModule {}
```

Bot components(such as the slash command class or gateways) no longer related with DiscordModule. Absolutely all providers
are searched globally through all modules. If you need to inject Discord client, you can only do this if you have 
exported providers from DiscordModule. The `DiscordModule` is not global, so a new `forFeature` function has been added.

```typescript
/* bot.module.ts */

import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';

import { BotGatewaty } from './bot.gateway';

@Module({
  imports: [DiscordModule.forFeature()],
  providers: [BotGatewaty],
})
export class BotModule {}
```

```typescript
/* bot.gateway.ts */

import { InjectDiscordClient, Once } from '@discord-nestjs/core';
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
}
```

So the `extraProviders` option is no longer needed.

#### Guards, pipes and filters

The `Request lifecycle` has also been reworked. Now he repeats it like in NestJS.

1. Incoming request
2. Globally bound middleware
3. Global guards
4. Controller guards
5. Route guards
6. Global pipes
7. Controller pipes
8. Route pipes
9. Method handler
10. Exception filters (route, then controller, then global). Apply from end to beginning.
11. Response

Removed options responsible for adding global guards, pipes and filters. Instead, add providers to the AppModule like so:

* `registerGuardGlobally()` - use for register global guard
* `registerPipeGlobally()` - use for register global pipe
* `registerFilterGlobally()` - use for register global guard

> The functions generate an always unique id, so each provider will be registered.

```typescript
/* app.module.ts */

import { DiscordModule, registerGuardGlobally } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Intents } from 'discord.js';

import { MyGlobalGuard } from './my-global-guard';
import { MySecondGlobalGuard } from './my-second-global-guard';
import { MyGlobalFilter } from './my-global-filter';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DiscordModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        token: configService.get('TOKEN'),
        discordClientOptions: {
          intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
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
    {
      provide: registerGuardGlobally(),
      useClass: MyGlobalGuard,
    },
    {
      provide: registerGuardGlobally(),
      useClass: MySecondGlobalGuard,
    },
    {
      provide: registerFilterGlobally(),
      useClass: MyGlobalFilter,
    },
  ],
})
export class AppModule {}
```

#### Providers by glob pattern

Previously, you could use the `commands` option, which allowed you to search files by glob pattern. All this functionality 
was moved to a separate library https://github.com/fjodor-rybakov/nestjs-dynamic-providers. 

Mark the `BotModule` with the `@InjectDynamicProviders` decorator.

```typescript
/* bot.module.ts */

import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { InjectDynamicProviders } from 'nestjs-dynamic-providers';

@InjectDynamicProviders('**/*.command.js')
@Module({
  imports: [DiscordModule.forFeature()],
})
export class BotModule {}
```

Also add the `resolveDynamicProviders()` function before creating the Nest application for add metadata for each module.

```typescript
/* main.ts */

import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { resolveDynamicProviders } from 'nestjs-dynamic-providers';

async function bootstrap() {
  await resolveDynamicProviders();
  const app = await NestFactory.createApplicationContext(AppModule);
  await app.init();
}

bootstrap();
```

> By default, classes are searched for that are marked with @Injectable() decorator. To override you need to pass 
> filterPredicate as parameters to @InjectDynamicProviders().

<details>
  <summary>Example with filter for `@Command` decorator only</summary>

```typescript
/* bot.module.ts */

import { COMMAND_DECORATOR, DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { InjectDynamicProviders, IsObject } from 'nestjs-dynamic-providers';

@InjectDynamicProviders({
  pattern: '**/*.command.js',
  filterPredicate: (type) =>
    IsObject(type) && Reflect.hasMetadata(COMMAND_DECORATOR, type.prototype),
})
@Module({
  imports: [DiscordModule.forFeature()],
})
export class BotModule {}

```
</details>

</details>

### The bot starts up, but the slash commands and events do not work

<details>
  <summary>Click to expand</summary>

Check your intent is passed to the `discordClientOptions` of the module. [More info](https://discordjs.guide/popular-topics/intents.html#privileged-intents)

</details>

### I created DTO and added `TransformPipe`, but when I receive response to the command, the DTO fields are missing

<details>
  <summary>Click to expand</summary>

Set `useDefineForClassFields` to `true` in your `tsconfig.json`.
Also check that the `Palyoad` and `UsePipes` decorators are imported from `@discord-nestjs/core`.

</details>

Any questions or suggestions? Discord Федок#3051
