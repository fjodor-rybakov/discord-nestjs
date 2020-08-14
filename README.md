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
<a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/dm/@nestjs/core.svg" alt="NPM Downloads" /></a>
<a href="https://travis-ci.org/nestjs/nest"><img src="https://api.travis-ci.org/nestjs/nest.svg?branch=master" alt="Travis" /></a>
<a href="https://travis-ci.org/nestjs/nest"><img src="https://img.shields.io/travis/nestjs/nest/master.svg?label=linux" alt="Linux" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#5" alt="Coverage" /></a>
<a href="https://gitter.im/nestjs/nestjs?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=body_badge"><img src="https://badges.gitter.im/nestjs/nestjs.svg" alt="Gitter" /></a>
<a href="https://opencollective.com/nest#backer"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec"><img src="https://img.shields.io/badge/Donate-PayPal-dc3d53.svg"/></a>
  <a href="https://twitter.com/nestframework"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

NestJS package for discord.js

## Installation

```bash
$ npm install discord-nestjs
```
OR 
```bash
$ yarn add discord-nestjs
```

## Usage

`app.module.ts`
```
@Module({
  imports: [DiscordModule.forRoot({
    token: '<Your discord token>',
    commandPrefix: '!'
  })]
})
export class AppModule {
}
```
Or async
```
@Module({
  imports: [DiscordModule.forRootAsync({
    imports: [DiscordModule.forRootAsync({
        useFactory: () => ({
          token: '<Your discord token>',
          commandPrefix: '!'
        }),
    })],
})
export class AppModule {
}
```

`app.controller.ts`
```
import { Injectable, Logger } from '@nestjs/common';
import { On, DiscordClient } from 'discord-nestjs';

@Injectable()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(
    private readonly discordClient: DiscordClient
  ) {
  }

  @On({events: 'ready'})
  async onReady(): Promise<void> {
    this.logger.log(`Logged in as ${this.discordClient.user.tag}!`);
  }
}
```

### You can use the following decorators:

#### Decorator @On handles discord events [see](https://gist.github.com/koad/316b265a91d933fd1b62dddfcc3ff584)
```
@On({events: 'message'})
async onMessage(message: Message): Promise<void> {
    if (!message.author.bot) {
        await message.reply('I\'m watching you');
    }
}
```
You can set this params
```
export interface OnDecoratorOptions {
  /**
   * Event type
   */
  events: keyof ClientEvents
}
```

#### Decorator @Once handles discord events [see](https://gist.github.com/koad/316b265a91d933fd1b62dddfcc3ff584)
```
@Once({events: 'message'})
async onceMessage(message: Message): Promise<void> {
    if (!message.author.bot) {
        await message.reply('I\'m watching you');
    }
}
```
You can set this params
```
export interface OnDecoratorOptions {
  /**
   * Event type
   */
  events: keyof ClientEvents
}
```

#### Decorator @Command handles command started with prefix
```
@OnCommand({name: 'start'})
async onCommand(message: Message): Promise<void> {
    await message.reply(`Execute command: ${message.content}`);
}
```
You can set this params
```
export interface OnCommandDecoratorOptions {
  /**
   * Command name
   */
  name: string;

  /**
   * Your message prefix
   * @default from module definition
   */
  prefix?: string;

  /**
   * Remove command name
   * @default true
   */
  isRemoveCommandName?: boolean;

  /**
   * Remove prefix from message
   * @default true
   */
  isRemovePrefix?: boolean;

  /**
   * Ignore bot message
   * @default true
   */
  isIgnoreBotMessage?: boolean;
}

```

## License

  Nest is [MIT licensed](LICENSE).
