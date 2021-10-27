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
  * [@discord-nestjs/sample-command](https://github.com/fjodor-rybakov/discord-nestjs/tree/master/packages/sample/command) - Example of bot with slash commands
  * [@discord-nestjs/sample-sub-command](https://github.com/fjodor-rybakov/discord-nestjs/tree/master/packages/sample/sub-command) - Example of bot with slash sub-commands and sub-groups
  * [@discord-nestjs/sample-validation](https://github.com/fjodor-rybakov/discord-nestjs/tree/master/packages/sample/validation) - Example of bot with slash commands validation
  * [@discord-nestjs/sample-event](https://github.com/fjodor-rybakov/discord-nestjs/tree/master/packages/sample/event) - Example of bot with events



## ❓ Answers on questions

### The bot starts up, but the slash commands and events do not work

Check your intent is passed to the `discordClientOptions` of the module. [More info](https://discordjs.guide/popular-topics/intents.html#privileged-intents)

### I created DTO and added `TransformPipe`, but when I receive response to the command, the DTO fields are missing

Check what your `target` version from `tsconfig.json`. Now is the minimal version of `ESNext`.
Also check that the `Palyoad` and `UsePipes` decorators are imported from `@discord-nestjs/core`.

### How to inject provider into your command, pipe, guard or filter

At the moment, this is only possible if the module is declared using `forRootAsync`.
First, you need to declare a separate module and set the necessary providers, as well as set them for export.

```typescript
import { PlayService } from './play.serivce';
import { Module } from '@nestjs/common';

@Module({
  providers: [PlayService],
  exports: [PlayService],
})
export class PlayModule {}
```

And then add this module to the `DiscordModule` imports

```typescript
import { PlayModule } from './services/play.module';
import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Intents, Message } from 'discord.js';

@Module({
  imports: [
    DiscordModule.forRootAsync({
      imports: [ConfigModule, PlayModule],
      useFactory: (configService: ConfigService) => ({
        token: configService.get('TOKEN'),
        commands: ['**/*.command.js'],
        discordClientOptions: {
          intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
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
  ],
})
export class BotModule {}
```

```typescript
import { PlayService } from '../services/play.serivce';
import { Command } from '@discord-nestjs/core';
import { DiscordCommand } from '@discord-nestjs/core/src';
import { CommandInteraction } from 'discord.js';

@Command({
  name: 'play',
  description: 'Plays a song',
})
export class PlayCommand implements DiscordCommand {
  constructor(private readonly playService: PlayService) {}

  handler(interaction: CommandInteraction): string {
    this.playService.play();
    return 'Nice.';
  }
}
```



Any questions or suggestions? Discord Федок#3051
