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

👾 NestJS package for discord.js

## 👨🏻‍💻 Installation

```bash
$ npm install discord-nestjs discord.js
```
OR 
```bash
$ yarn add discord-nestjs discord.js
```

## 📑 Overview
You can use `forRoot` or `forRootAsync` to configure your module
* `token` * - your discord bot token [see](https://discord.com/developers/applications)
* `commandPrefix` * - global prefix for command events
* `allowGuilds` - list of Guild IDs that the bot is allowed to work with
* `denyGuilds` - list of Guild IDs that the bot is not allowed to work with
* `allowChannels` - linking commands to a channel (can also be set through a decorator)
    * `commandName` * - command name
    * `channels` * - channel ID list
* you can also set all options as for the client from the "discord.js" library

#### 💡 Example
```typescript
/*bot.module.ts*/

@Module({
  imports: [DiscordModule.forRoot({
    token: 'Njg2MzI2OTMwNTg4NTY1NTQx.XmVlww.EF_bMXRvYgMUCQhg_jYnieoBW-k',
    commandPrefix: '!',
    allowGuilds: ['745366351929016363'],
    denyGuilds: ['520622812742811698'],
    allowChannels: [{
      commandName: 'some',
      channels: ['745366352386326572'] 
    }]
    // and other discord options
  })],
  providers: [BotGateway]
})
export class BotModule {
}
```
Or async
```typescript
/*bot.module.ts*/

@Module({
  imports: [DiscordModule.forRootAsync({
    useFactory: () => ({
      token: 'Njg2MzI2OTMwNTg4NTY1NTQx.XmVlww.EF_bMXRvYgMUCQhg_jYnieoBW-k',
      commandPrefix: '!',
      allowGuilds: ['745366351929016363'],
      denyGuilds: ['520622812742811698'],
      allowChannels: [{
        commandName: 'some',
        channels: ['745366352386326572'] 
      }]
      // and other discord options
    })
  })],
  providers: [BotGateway]
})
export class BotModule {
}
```
## ▶️ Usage
Create your class (e.g. `BotGateway`), mark it with `@Injectable()` or `@Controller()`

#### 💡 Example
```typescript
/*bot.gateway.ts*/

import { Injectable, Logger } from '@nestjs/common';
import { On, DiscordClient } from 'discord-nestjs';

@Injectable()
export class BotGateway {
  private readonly logger = new Logger(BotGateway.name);

  constructor(
    private readonly discordClient: DiscordClient
  ) {
  }

  @On({event: 'ready'})
  onReady(): void {
    this.logger.log(`Logged in as ${this.discordClient.user.tag}!`);
  }
}
```

## ✨ You can use the following decorators:

### ℹ️ Decorator @Client
You can get discord client via @Client() decorator instead constructor property

#### 💡 Example
```typescript
/*bot.gateway.ts*/

import { Injectable, Logger } from '@nestjs/common';
import { On, DiscordClient } from 'discord-nestjs';

@Injectable()
export class BotGateway {
  private readonly logger = new Logger(BotGateway.name);

  @Client()
  discordClient: DiscordClient;

  @On({event: 'ready'})
  onReady(): void {
    this.logger.log(`Logged in as ${this.discordClient.user.tag}!`);
  }
}
```

### ℹ️ Decorator @Command
Use the @Command decorator to handle incoming commands to the bot
* name * - command name
* prefix - override global prefix
* isRemoveCommandName - remove command name from message
* isRemovePrefix - remove prefix name from message
* isIgnoreBotMessage - ignore incoming messages from bots
* allowChannels - List of channel identifiers on which this command will work

#### 💡 Example
```typescript
/*bot.gateway.ts*/

@Injectable()
export class BotGateway {
  @OnCommand({name: 'start'})
  async onCommand(message: Message): Promise<void> {
      await message.reply(`Execute command: ${message.content}`);
  }
}
```

### ℹ️ Decorator @On
Handle discord events [see](https://gist.github.com/koad/316b265a91d933fd1b62dddfcc3ff584)
* event * - name of the event to listen to

#### 💡 Example
```typescript
/*bot.gateway.ts*/

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

### ℹ️ Decorator @Once
Handle discord events (only once) [see](https://gist.github.com/koad/316b265a91d933fd1b62dddfcc3ff584)
* event * - name of the event to listen to

#### 💡 Example
```typescript
/*bot.gateway.ts*/

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

### ℹ️ Decorator @UseInterceptors (Test feature)
To intercept incoming messages you can use `@UseInterceptors()` decorator

#### 💡 Example
You need to implement `DiscordInterceptor` interface
```typescript
/*bot.interceptor.ts*/

import { DiscordInterceptor } from 'discord-nestjs';
import { ClientEvents } from 'discord.js';

export class BotInterceptor implements DiscordInterceptor {
  intercept(event: keyof ClientEvents, context: any): any {
    return 'Some custom value';
  }
}
```

```typescript
/*bot.gateway.ts*/
import { On, UseInterceptors } from 'discord-nestjs';

@Injectable()
export class BotGateway {
  @UseInterceptors(BotInterceptor)
  @On({event: 'message'})
  async onSomeEvent(context: string): Promise<void> {
      // to do something
  }
}
```

### ℹ️ Decorator @Middleware (Test feature)
For handling intermediate requests you can use `@Middleware` decorator
* allowEvents - handled events
* denyEvents - skipped events

#### 💡 Example
You need to implement `DiscordMiddleware` interface
```typescript
/*bot.middleware.ts*/

@Middleware()
export class BotMiddleware implements DiscordMiddleware {
  private readonly logger = new Logger(BotMiddleware.name);

  use(
    event: keyof ClientEvents,
    context: ClientEvents[keyof ClientEvents]
  ): void {
    if (event === 'message') {
      this.logger.log('On message event triggered');
    }
  }
}
```
Don't forget to add to providers
```typescript
@Module({
  providers: [BotMiddleware]
})
export class BotModule {
}
```

Any questions or suggestions? Discord Федок#3051
