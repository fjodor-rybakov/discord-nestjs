import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { Test, TestingModule } from '@nestjs/testing';

import { registerFilterGlobally } from '../utils/function/register-filter-globally';
import { registerGuardGlobally } from '../utils/function/register-guard-globally';
import { registerPipeGlobally } from '../utils/function/register-pipe-globally';
import { GlobalProviderService } from './global-provider.service';

describe('Global provider service', () => {
  let moduleFixture: TestingModule;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      providers: [GlobalProviderService],
    }).compile();
  });

  describe('sortGlobalProviders method', () => {
    it('should correct sort', () => {
      const mockedGlobalGuardProviders = [
        { token: registerGuardGlobally() },
        { token: registerGuardGlobally(1) },
        { token: registerGuardGlobally(2) },
        { token: registerGuardGlobally(11) },
      ] as InstanceWrapper[];

      const mockedGlobalPipeProviders = [
        { token: registerPipeGlobally(1) },
        { token: registerPipeGlobally() },
      ] as InstanceWrapper[];

      const mockedGlobalFilterProviders = [
        { token: registerFilterGlobally(1) },
        { token: registerFilterGlobally(2) },
        { token: registerFilterGlobally(0) },
        { token: registerFilterGlobally(3) },
      ] as InstanceWrapper[];

      const result = moduleFixture
        .get(GlobalProviderService)
        .sortGlobalProviders([
          ...mockedGlobalGuardProviders,
          ...mockedGlobalPipeProviders,
          ...mockedGlobalFilterProviders,
        ]);

      expect(result).toMatchInlineSnapshot(`
        Array [
          Object {
            "token": "__discord_app_guard__:0",
          },
          Object {
            "token": "__discord_app_pipe__:0",
          },
          Object {
            "token": "__discord_app_filter__:0",
          },
          Object {
            "token": "__discord_app_guard__:1",
          },
          Object {
            "token": "__discord_app_pipe__:1",
          },
          Object {
            "token": "__discord_app_filter__:1",
          },
          Object {
            "token": "__discord_app_guard__:2",
          },
          Object {
            "token": "__discord_app_filter__:2",
          },
          Object {
            "token": "__discord_app_filter__:3",
          },
          Object {
            "token": "__discord_app_guard__:11",
          },
        ]
      `);
    });
  });
});
