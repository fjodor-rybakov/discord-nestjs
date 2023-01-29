# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [5.0.0](https://github.com/fjodor-rybakov/discord-nestjs/compare/@discord-nestjs/core@4.3.1...@discord-nestjs/core@5.0.0) (2023-01-29)

### Bug Fixes

- IA decorator ([a44d5f9](https://github.com/fjodor-rybakov/discord-nestjs/commit/a44d5f9cce16db9fe2d497678aead9a907420249))
- Subcommands ([64c0288](https://github.com/fjodor-rybakov/discord-nestjs/commit/64c0288f4aa95ecfe5848c781d80b93bbca007e2))
- typos in prefix-command decorator ([a895d14](https://github.com/fjodor-rybakov/discord-nestjs/commit/a895d141ada8be0d25beb307db996faa6be331df))

### Code Refactoring

- Remove all custom pipes, guard, filters and middlewares ([c0c78c1](https://github.com/fjodor-rybakov/discord-nestjs/commit/c0c78c1b8a0614b3a931afa404765d65e414b4d9))

### Features

- Add AppliedCollectors decorator ([f2950ac](https://github.com/fjodor-rybakov/discord-nestjs/commit/f2950ac777d3e85971bd438659ae9a497d6c4591))
- Add forGuild in @Command decorator ([f8a4a09](https://github.com/fjodor-rybakov/discord-nestjs/commit/f8a4a098c28c52b9753bff7c86e23ee914525d6d))
- Add inject cause event ([6d8c8b9](https://github.com/fjodor-rybakov/discord-nestjs/commit/6d8c8b9bd410e3e3342cb9aeb4434a6fc5aeb829))
- Replace to Nest consumers ([e3549b6](https://github.com/fjodor-rybakov/discord-nestjs/commit/e3549b60e40ce2eda1401e24735036e09fac8003))
- Rework event handling ([3cec789](https://github.com/fjodor-rybakov/discord-nestjs/commit/3cec78940d96059a2f36fa0b721a52ddfcc91d42))
- Rework prefix command ([3ac2bb5](https://github.com/fjodor-rybakov/discord-nestjs/commit/3ac2bb5e6883edb12c5773291457002d01aca4a3))
- Rework slash commands ([0b722ae](https://github.com/fjodor-rybakov/discord-nestjs/commit/0b722ae69819ec7a959ea0510dac088d6fdc1eed))
- Rewrite collector consumers ([083337a](https://github.com/fjodor-rybakov/discord-nestjs/commit/083337a2c1326c98a221d48bbf83da8df3b648b5))
- Rewrite decorator descriptions ([4378799](https://github.com/fjodor-rybakov/discord-nestjs/commit/4378799d81a6c072c0abe8c5009802c16a6fcd4e))
- Rewrite docs ([a381c19](https://github.com/fjodor-rybakov/discord-nestjs/commit/a381c19214a0d80d857bf0278d87d6a244d1455b))
- Rewrite nav menu ([33b7f19](https://github.com/fjodor-rybakov/discord-nestjs/commit/33b7f19a53f247b2212a7398e99f377903065bd4))

### BREAKING CHANGES

- Remove all custom pipes, guard, filters and middlewares(Use nest consumers instead)
- Remove DiscordCommandInterface(use @Handler decorator instead)
  Add @CommandOption decorator for each slash command dto
  Rework slash command pipe
- Remove prefix command decorator(use interceptor instead)
- Remove support guards, filters and pipes from discord-nestjs(use nest consumers instead)

## [4.3.1](https://github.com/fjodor-rybakov/discord-nestjs/compare/@discord-nestjs/core@4.3.0...@discord-nestjs/core@4.3.1) (2022-10-02)

**Note:** Version bump only for package @discord-nestjs/core

# [4.3.0](https://github.com/fjodor-rybakov/discord-nestjs/compare/@discord-nestjs/core@4.2.1...@discord-nestjs/core@4.3.0) (2022-09-07)

### Features

- Add shutdownOnAppDestroy option ([8251528](https://github.com/fjodor-rybakov/discord-nestjs/commit/8251528f2b4f3d993ead043f9922a13891079c8a))

## [4.2.1](https://github.com/fjodor-rybakov/discord-nestjs/compare/@discord-nestjs/core@4.2.0...@discord-nestjs/core@4.2.1) (2022-08-15)

### Bug Fixes

- Check exist metadata before cache ([309f558](https://github.com/fjodor-rybakov/discord-nestjs/commit/309f55841d55cb7cae1b233de94e26423fcb66bd))

# [4.2.0](https://github.com/fjodor-rybakov/discord-nestjs/compare/@discord-nestjs/core@4.1.1...@discord-nestjs/core@4.2.0) (2022-08-15)

### Features

- Male unique middleware decorator ([f06fa6e](https://github.com/fjodor-rybakov/discord-nestjs/commit/f06fa6e420344bf1d1ffd184b96d7428d932066e))

## [4.1.1](https://github.com/fjodor-rybakov/discord-nestjs/compare/@discord-nestjs/core@4.1.0...@discord-nestjs/core@4.1.1) (2022-07-29)

**Note:** Version bump only for package @discord-nestjs/core

# [4.1.0](https://github.com/fjodor-rybakov/discord-nestjs/compare/@discord-nestjs/core@4.0.2...@discord-nestjs/core@4.1.0) (2022-07-29)

### Features

- Add failOnLogin option ([5d4d690](https://github.com/fjodor-rybakov/discord-nestjs/commit/5d4d69020aa4a7d24e0686a91568f5a4443f3dcd))

## [4.0.2](https://github.com/fjodor-rybakov/discord-nestjs/compare/@discord-nestjs/core@4.0.1...@discord-nestjs/core@4.0.2) (2022-07-20)

**Note:** Version bump only for package @discord-nestjs/core

## [4.0.1](https://github.com/fjodor-rybakov/discord-nestjs/compare/@discord-nestjs/core@4.0.0...@discord-nestjs/core@4.0.1) (2022-07-19)

**Note:** Version bump only for package @discord-nestjs/core

# [4.0.0](https://github.com/fjodor-rybakov/discord-nestjs/compare/@discord-nestjs/core@3.6.0...@discord-nestjs/core@4.0.0) (2022-07-19)

### Features

- Add attachment type ([1727eea](https://github.com/fjodor-rybakov/discord-nestjs/commit/1727eeaab8af80f96bf7109951c85dbc6524599f))
- Add field type to option ([75680a0](https://github.com/fjodor-rybakov/discord-nestjs/commit/75680a020cbf180a7904679a85087a67d5e7ef9c))
- Add localization for sub command group ([5501035](https://github.com/fjodor-rybakov/discord-nestjs/commit/5501035e3d9f89a67c88446e633b42dde7e80834))
- Add new options for slash command params, optimise explore dto instance ([5002b0d](https://github.com/fjodor-rybakov/discord-nestjs/commit/5002b0d2e91790994b3a6b812f11139c948ad944))
- Update to discord v14 ([6fd5732](https://github.com/fjodor-rybakov/discord-nestjs/commit/6fd57322ab7882b8811551b88339cb4918207fa2))

### BREAKING CHANGES

- Drop support discord v13

# [3.6.0](https://github.com/fjodor-rybakov/discord-nestjs/compare/@discord-nestjs/core@3.5.1...@discord-nestjs/core@3.6.0) (2022-07-11)

### Features

- Add new trigger function for slash command registration ([ed8243d](https://github.com/fjodor-rybakov/discord-nestjs/commit/ed8243d4226f1688854b8d3f3dc71cc83f5b9558))

## [3.5.1](https://github.com/fjodor-rybakov/discord-nestjs/compare/@discord-nestjs/core@3.5.0...@discord-nestjs/core@3.5.1) (2022-07-10)

**Note:** Version bump only for package @discord-nestjs/core

# [3.5.0](https://github.com/fjodor-rybakov/discord-nestjs/compare/@discord-nestjs/core@3.4.0...@discord-nestjs/core@3.5.0) (2022-07-07)

### Features

- Add transform to dto for modal ([5fa6a4d](https://github.com/fjodor-rybakov/discord-nestjs/commit/5fa6a4dfd6bb62f66ba8a29c2975f9a9688d2009))
- Make customId optional ([0ea084d](https://github.com/fjodor-rybakov/discord-nestjs/commit/0ea084dc9f28f66cedeb2d21ab78506dc0e94de8))

# [3.4.0](https://github.com/fjodor-rybakov/discord-nestjs/compare/@discord-nestjs/core@3.3.4...@discord-nestjs/core@3.4.0) (2022-06-17)

### Features

- Add priority for global filter, pipe and guard ([8653bc4](https://github.com/fjodor-rybakov/discord-nestjs/commit/8653bc41f0ee4ec025ff8b27d7a28e8b9d7cfce7))

## [3.3.4](https://github.com/fjodor-rybakov/discord-nestjs/compare/@discord-nestjs/core@3.3.3...@discord-nestjs/core@3.3.4) (2022-06-15)

### Bug Fixes

- Set permission for slash commands ([633c9e1](https://github.com/fjodor-rybakov/discord-nestjs/commit/633c9e1ec38b972e7089569c815df46a3084fcae))

## [3.3.3](https://github.com/fjodor-rybakov/discord-nestjs/compare/@discord-nestjs/core@3.3.2...@discord-nestjs/core@3.3.3) (2022-06-15)

**Note:** Version bump only for package @discord-nestjs/core

## [3.3.2](https://github.com/fjodor-rybakov/discord-nestjs/compare/@discord-nestjs/core@3.3.1...@discord-nestjs/core@3.3.2) (2022-06-07)

**Note:** Version bump only for package @discord-nestjs/core
