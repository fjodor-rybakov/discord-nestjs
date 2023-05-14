# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [5.2.5](https://github.com/fjodor-rybakov/discord-nestjs/compare/@discord-nestjs/common@5.2.4...@discord-nestjs/common@5.2.5) (2023-05-14)

**Note:** Version bump only for package @discord-nestjs/common

## [5.2.4](https://github.com/fjodor-rybakov/discord-nestjs/compare/@discord-nestjs/common@5.2.3...@discord-nestjs/common@5.2.4) (2023-05-03)

**Note:** Version bump only for package @discord-nestjs/common

## [5.2.3](https://github.com/fjodor-rybakov/discord-nestjs/compare/@discord-nestjs/common@5.2.2...@discord-nestjs/common@5.2.3) (2023-03-20)

**Note:** Version bump only for package @discord-nestjs/common

## [5.2.2](https://github.com/fjodor-rybakov/discord-nestjs/compare/@discord-nestjs/common@5.2.1...@discord-nestjs/common@5.2.2) (2023-03-12)

**Note:** Version bump only for package @discord-nestjs/common

## [5.2.1](https://github.com/fjodor-rybakov/discord-nestjs/compare/@discord-nestjs/common@5.2.0...@discord-nestjs/common@5.2.1) (2023-02-28)

**Note:** Version bump only for package @discord-nestjs/common

# [5.2.0](https://github.com/fjodor-rybakov/discord-nestjs/compare/@discord-nestjs/common@5.1.7...@discord-nestjs/common@5.2.0) (2023-02-24)

### Features

- Set attachment object if prop type is Attachment ([7c659d8](https://github.com/fjodor-rybakov/discord-nestjs/commit/7c659d8873fed59ddc544638ad77d7a22d839976))

## [5.1.7](https://github.com/fjodor-rybakov/discord-nestjs/compare/@discord-nestjs/common@5.1.6...@discord-nestjs/common@5.1.7) (2023-02-24)

**Note:** Version bump only for package @discord-nestjs/common

## [5.1.6](https://github.com/fjodor-rybakov/discord-nestjs/compare/@discord-nestjs/common@5.1.5...@discord-nestjs/common@5.1.6) (2023-02-22)

**Note:** Version bump only for package @discord-nestjs/common

## [5.1.5](https://github.com/fjodor-rybakov/discord-nestjs/compare/@discord-nestjs/common@5.1.4...@discord-nestjs/common@5.1.5) (2023-02-14)

**Note:** Version bump only for package @discord-nestjs/common

## [5.1.4](https://github.com/fjodor-rybakov/discord-nestjs/compare/@discord-nestjs/common@5.1.3...@discord-nestjs/common@5.1.4) (2023-02-05)

### Bug Fixes

- Broken modal decorators ([258103e](https://github.com/fjodor-rybakov/discord-nestjs/commit/258103e3ff276bba2ff0b4847c1f0284d086ee3f))
- Var name ([6da23f6](https://github.com/fjodor-rybakov/discord-nestjs/commit/6da23f61ecf1b78039fd2995c27f46053bafb8b3))
- Vulnerable ([64872ce](https://github.com/fjodor-rybakov/discord-nestjs/commit/64872cef3e6db14c5d80377b325daca2ef2102dc))

## [5.1.3](https://github.com/fjodor-rybakov/discord-nestjs/compare/@discord-nestjs/common@5.1.2...@discord-nestjs/common@5.1.3) (2023-01-31)

**Note:** Version bump only for package @discord-nestjs/common

## [5.1.2](https://github.com/fjodor-rybakov/discord-nestjs/compare/@discord-nestjs/common@5.1.1...@discord-nestjs/common@5.1.2) (2023-01-31)

### Bug Fixes

- Add check is dto in all pipes ([9c78f8c](https://github.com/fjodor-rybakov/discord-nestjs/commit/9c78f8c70a44fa79c870566b17ebb897fc915bb2))

## [5.1.1](https://github.com/fjodor-rybakov/discord-nestjs/compare/@discord-nestjs/common@5.1.0...@discord-nestjs/common@5.1.1) (2023-01-30)

**Note:** Version bump only for package @discord-nestjs/common

# [5.1.0](https://github.com/fjodor-rybakov/discord-nestjs/compare/@discord-nestjs/common@5.0.0...@discord-nestjs/common@5.1.0) (2023-01-30)

### Features

- Command option decorator unnecessary, mark as deprecated ([0b248f1](https://github.com/fjodor-rybakov/discord-nestjs/commit/0b248f16f75c1373284fe960efd1d5ae7f357b76))

# [5.0.0](https://github.com/fjodor-rybakov/discord-nestjs/compare/@discord-nestjs/common@4.0.8...@discord-nestjs/common@5.0.0) (2023-01-29)

### Bug Fixes

- modal 'fields' are undefined in some cases ([85d51ad](https://github.com/fjodor-rybakov/discord-nestjs/commit/85d51ad64a283c5bddca77a8d0f7885fad9f1f20))

### Features

- Rework modal ([fd58fd5](https://github.com/fjodor-rybakov/discord-nestjs/commit/fd58fd5e9c15cdb6c6f95c312dcf79c1fbc1160e))
- Rework prefix command ([3ac2bb5](https://github.com/fjodor-rybakov/discord-nestjs/commit/3ac2bb5e6883edb12c5773291457002d01aca4a3))
- Rework slash commands ([0b722ae](https://github.com/fjodor-rybakov/discord-nestjs/commit/0b722ae69819ec7a959ea0510dac088d6fdc1eed))
- Rework validation ([e7fd0d7](https://github.com/fjodor-rybakov/discord-nestjs/commit/e7fd0d700a46dca00c080d385fdfd99704592e98))
- Rewrite collector consumers ([083337a](https://github.com/fjodor-rybakov/discord-nestjs/commit/083337a2c1326c98a221d48bbf83da8df3b648b5))
- Update README for common package ([0f8f487](https://github.com/fjodor-rybakov/discord-nestjs/commit/0f8f487a5a9724b418010596e0ff690e45f2e7b1))

### BREAKING CHANGES

- Remove DiscordCommandInterface(use @Handler decorator instead)
  Add @CommandOption decorator for each slash command dto
  Rework slash command pipe
- Remove prefix command decorator(use interceptor instead)

## [4.0.8](https://github.com/fjodor-rybakov/discord-nestjs/compare/@discord-nestjs/common@4.0.7...@discord-nestjs/common@4.0.8) (2022-10-02)

**Note:** Version bump only for package @discord-nestjs/common

## [4.0.7](https://github.com/fjodor-rybakov/discord-nestjs/compare/@discord-nestjs/common@4.0.6...@discord-nestjs/common@4.0.7) (2022-09-07)

**Note:** Version bump only for package @discord-nestjs/common

## [4.0.6](https://github.com/fjodor-rybakov/discord-nestjs/compare/@discord-nestjs/common@4.0.5...@discord-nestjs/common@4.0.6) (2022-08-15)

**Note:** Version bump only for package @discord-nestjs/common

## [4.0.5](https://github.com/fjodor-rybakov/discord-nestjs/compare/@discord-nestjs/common@4.0.4...@discord-nestjs/common@4.0.5) (2022-08-15)

**Note:** Version bump only for package @discord-nestjs/common

## [4.0.4](https://github.com/fjodor-rybakov/discord-nestjs/compare/@discord-nestjs/common@4.0.3...@discord-nestjs/common@4.0.4) (2022-07-29)

**Note:** Version bump only for package @discord-nestjs/common

## [4.0.3](https://github.com/fjodor-rybakov/discord-nestjs/compare/@discord-nestjs/common@4.0.2...@discord-nestjs/common@4.0.3) (2022-07-29)

**Note:** Version bump only for package @discord-nestjs/common

## [4.0.2](https://github.com/fjodor-rybakov/discord-nestjs/compare/@discord-nestjs/common@4.0.1...@discord-nestjs/common@4.0.2) (2022-07-20)

**Note:** Version bump only for package @discord-nestjs/common

## [4.0.1](https://github.com/fjodor-rybakov/discord-nestjs/compare/@discord-nestjs/common@4.0.0...@discord-nestjs/common@4.0.1) (2022-07-19)

**Note:** Version bump only for package @discord-nestjs/common

# [4.0.0](https://github.com/fjodor-rybakov/discord-nestjs/compare/@discord-nestjs/common@3.4.2...@discord-nestjs/common@4.0.0) (2022-07-19)

### Features

- Add field type to option ([75680a0](https://github.com/fjodor-rybakov/discord-nestjs/commit/75680a020cbf180a7904679a85087a67d5e7ef9c))
- Update to discord v14 ([6fd5732](https://github.com/fjodor-rybakov/discord-nestjs/commit/6fd57322ab7882b8811551b88339cb4918207fa2))

### BREAKING CHANGES

- Drop support discord v13

## [3.4.2](https://github.com/fjodor-rybakov/discord-nestjs/compare/@discord-nestjs/common@3.4.1...@discord-nestjs/common@3.4.2) (2022-07-11)

**Note:** Version bump only for package @discord-nestjs/common

## [3.4.1](https://github.com/fjodor-rybakov/discord-nestjs/compare/@discord-nestjs/common@3.4.0...@discord-nestjs/common@3.4.1) (2022-07-10)

**Note:** Version bump only for package @discord-nestjs/common

# [3.4.0](https://github.com/fjodor-rybakov/discord-nestjs/compare/@discord-nestjs/common@3.3.5...@discord-nestjs/common@3.4.0) (2022-07-07)

### Features

- Add transform to dto for modal ([5fa6a4d](https://github.com/fjodor-rybakov/discord-nestjs/commit/5fa6a4dfd6bb62f66ba8a29c2975f9a9688d2009))
- Make customId optional ([0ea084d](https://github.com/fjodor-rybakov/discord-nestjs/commit/0ea084dc9f28f66cedeb2d21ab78506dc0e94de8))

## [3.3.5](https://github.com/fjodor-rybakov/discord-nestjs/compare/@discord-nestjs/common@3.3.4...@discord-nestjs/common@3.3.5) (2022-06-17)

**Note:** Version bump only for package @discord-nestjs/common

## [3.3.4](https://github.com/fjodor-rybakov/discord-nestjs/compare/@discord-nestjs/common@3.3.3...@discord-nestjs/common@3.3.4) (2022-06-15)

**Note:** Version bump only for package @discord-nestjs/common

## [3.3.3](https://github.com/fjodor-rybakov/discord-nestjs/compare/@discord-nestjs/common@3.3.2...@discord-nestjs/common@3.3.3) (2022-06-15)

**Note:** Version bump only for package @discord-nestjs/common

## [3.3.2](https://github.com/fjodor-rybakov/discord-nestjs/compare/@discord-nestjs/common@3.3.1...@discord-nestjs/common@3.3.2) (2022-06-07)

**Note:** Version bump only for package @discord-nestjs/common
