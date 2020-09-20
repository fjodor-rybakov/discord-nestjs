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

## Description

NestJS package for discord.js

## Installation

```bash
$ npm install discord-nestjs discord.js
```
OR 
```bash
$ yarn add discord-nestjs discord.js
```

## Overview
Configuration
```typescript
/*app.module.ts*/

@Module({
  imports: [DiscordModule.forRoot({
    token: '<Your discord token>',
    commandPrefix: '!',
    allowGuilds: ['Some guild id'], // Optional
    denyGuilds: ['Some guild id'] // Optional
  })],
  providers: [BotGateway]
})
export class BotModule {
}
```
Or async
```typescript
/*app.module.ts*/

@Module({
  imports: [DiscordModule.forRootAsync({
    useFactory: () => ({
      token: '<Your discord token>',
      commandPrefix: '!',
      allowGuilds: ['Some guild id'], // Optional
      denyGuilds: ['Some guild id'] // Optional
    })
  })],
  providers: [BotGateway]
})
export class BotModule {
}
```
Usage
```typescript
/*app.controller.ts*/

import { Injectable, Logger } from '@nestjs/common';
import { On, DiscordClient } from 'discord-nestjs';

@Injectable() /* You can use @Controller() or @Injectable() decorator */
export class BotGateway {
  private readonly logger = new Logger(AppController.name);

  constructor(
    private readonly discordClient: DiscordClient
  ) {
  }

  @On({event: 'ready'})
  async onReady(): Promise<void> {
    this.logger.log(`Logged in as ${this.discordClient.user.tag}!`);
  }
}
```

## You can use the following decorators:

### Decorator @Command handles command started with prefix
```typescript
@Injectable()
export class BotGateway {
  @OnCommand({name: 'start'})
  async onCommand(message: Message): Promise<void> {
      await message.reply(`Execute command: ${message.content}`);
  }
}
```
You can set this params
```typescript
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
  
  /**
   * List of channel identifiers with which the bot will work
   */
  allowChannels?: string[];
}
```

### Decorator @On handles discord events [see](https://gist.github.com/koad/316b265a91d933fd1b62dddfcc3ff584)
```typescript
@Injectable()
export class BotGateway {
  @On({event: 'message'})
  async onMessage(message: Message): Promise<void> {
    if (!message.author.bot) {
      await message.reply('I\'m watching you');
    }
  }
}
```
You can set this params
```typescript
export interface OnDecoratorOptions {
  /**
   * Event type
   */
  event: keyof ClientEvents
}
```

### Decorator @Once handles discord events [see](https://gist.github.com/koad/316b265a91d933fd1b62dddfcc3ff584)
```typescript
@Injectable()
export class BotGateway {
  @Once({event: 'message'})
  async onceMessage(message: Message): Promise<void> {
    if (!message.author.bot) {
      await message.reply('I\'m watching you');
    }
  }
}
```
You can set this params
```typescript
export interface OnDecoratorOptions {
  /**
   * Event type
   */
  event: keyof ClientEvents
}
```

### Decorator @Middleware (Test feature)

You must implement `DiscordMiddleware` interface
```typescript
@Middleware()
export class BotMiddleware implements DiscordMiddleware {
  private readonly logger = new Logger(BotMiddleware.name);

  use(event: keyof ClientEvents, context: ClientEvents[keyof ClientEvents]): void {
    if (event === 'message') {
      this.logger.log('On message event triggered');
    }
  }
}
```
You can set this params
```typescript
export interface MiddlewareOptions {
  /**
   * Take events
   */
  allowEvents?: Array<keyof ClientEvents>;

  /**
   * Skip events
   */
  denyEvents?: Array<keyof ClientEvents>;
}
```
and add to providers
```typescript
@Module({
  providers: [BotMiddleware]
})
export class BotModule {
}
```

Any questions or suggestions? Discord Федок#3051
