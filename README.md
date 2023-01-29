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
* [@discord-nestjs/common](https://github.com/fjodor-rybakov/discord-nestjs/tree/master/packages/common) - Contains optional common templates. For example SlashCommandPipe or ValidationPipe.
* [@discord-nestjs/schematics](https://github.com/fjodor-rybakov/discord-nestjs/tree/master/packages/schematics) - Provides cli to create a bot template.
* Samples
  * [@sample/command](https://github.com/fjodor-rybakov/discord-nestjs/tree/master/packages/sample/command) - Bot example with slash commands
  * [@sample/command-by-glob](https://github.com/fjodor-rybakov/discord-nestjs/tree/master/packages/sample/command-by-glob) - Bot example with slash commands by glob pattern
  * [@sample/command-by-http-request](https://github.com/fjodor-rybakov/discord-nestjs/tree/master/packages/sample/command-by-http-request) - Bot example with register slash commands by http request
  * [@sample/sub-command](https://github.com/fjodor-rybakov/discord-nestjs/tree/master/packages/sample/sub-command) - Bot example with slash sub-commands and sub-groups
  * [@sample/validation](https://github.com/fjodor-rybakov/discord-nestjs/tree/master/packages/sample/validation) - Bot example with slash commands validation
  * [@sample/event](https://github.com/fjodor-rybakov/discord-nestjs/tree/master/packages/sample/event) - Bot example with events
  * [@sample/dependency-injection](https://github.com/fjodor-rybakov/discord-nestjs/tree/master/packages/sample/dependency-injection) - Bot example with dependency injection
  * [@sample/reaction-collector](https://github.com/fjodor-rybakov/discord-nestjs/tree/master/packages/sample/reaction-collector) - Bot example with reaction collector
  * [@sample/message-collector](https://github.com/fjodor-rybakov/discord-nestjs/tree/master/packages/sample/message-collector) - Bot example with message collector
  * [@sample/interaction-collector](https://github.com/fjodor-rybakov/discord-nestjs/tree/master/packages/sample/interaction-collector) - Bot example with interaction collector
  * [@sample/prefix-command](https://github.com/fjodor-rybakov/discord-nestjs/tree/master/packages/sample/prefix-command) - Bot example with prefix command
  * [@sample/modals](https://github.com/fjodor-rybakov/discord-nestjs/tree/master/packages/sample/modals) - Bot example with modals



## ❓ Answers on questions

### The bot starts up, but the slash commands and events do not work

<details>
  <summary>Click to expand</summary>

Check your intent is passed to the `discordClientOptions` of the module. [More info](https://discordjs.guide/popular-topics/intents.html#privileged-intents)

</details>

### I created DTO and added `SlashCommandPipe`, but when I receive response to the command, the DTO fields are missing

<details>
  <summary>Click to expand</summary>

Set `useDefineForClassFields` to `true` in your `tsconfig.json`.
Also check that the `@CommandOptions` and `@InteractionEvent` decorators are set.

</details>

Any questions or suggestions? Join Discord https://discord.gg/kv89Q2dXSR
