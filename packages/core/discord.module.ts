import { DynamicModule, Module, Provider, Type } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { DiscordModuleAsyncOptions } from './interface/discord-module-async-options';
import { DiscordOptionsFactory } from './interface/discord-options-factory';
import { ModuleConstant } from './constant/module.constant';
import { DiscordClientProvider } from './provider/discord-client-provider';
import { DiscordService } from './service/discord.service';
import { DiscordModuleOption } from './interface/discord-module-option';
import { ReflectMetadataProvider } from './provider/reflect-metadata.provider';
import { DiscordHandlerService } from './service/discord-handler.service';
import { DiscordAccessService } from './service/discord-access.service';
import { GuardResolver } from './resolver/guard.resolver';
import { OnCommandResolver } from './resolver/on-command.resolver';
import { DiscordResolverService } from './service/discord-resolver.service';
import { MiddlewareResolver } from './resolver/middleware.resolver';
import { PipeResolver } from './resolver/pipe.resolver';
import { ParamResolver } from './resolver/param.resolver';
import { OnEventResolver } from './resolver/on-event.resolver';
import { OnceEventResolver } from './resolver/once-event.resolver';
import { ClientResolver } from './resolver/client.resolver';
import { TransformProvider } from './provider/transform.provider';
import { ValidationProvider } from './provider/validation.provider';
import { TransformParamResolver } from './resolver/transform-param.resolver';
import { DiscordCatchService } from './service/discord-catch.service';
import { GuardClassResolver } from './resolver/guard-class.resolver';
import { PipeClassResolver } from './resolver/pipe-class.resolver';

@Module({
  imports: [DiscoveryModule],
})
export class DiscordModule {
  static forRoot(options: DiscordModuleOption): DynamicModule {
    return {
      module: DiscordModule,
      providers: [
        DiscordModule.createDiscordOptionProvider(options),
        MiddlewareResolver,
        GuardResolver,
        PipeResolver,
        ParamResolver,
        OnEventResolver,
        OnceEventResolver,
        OnCommandResolver,
        TransformParamResolver,
        ReflectMetadataProvider,
        DiscordHandlerService,
        DiscordAccessService,
        DiscordCatchService,
        DiscordService,
        DiscordClientProvider,
        DiscordResolverService,
        ClientResolver,
        TransformProvider,
        ValidationProvider,
        GuardClassResolver,
        PipeClassResolver
      ],
      exports: [DiscordClientProvider, TransformProvider, ValidationProvider],
    };
  }

  static forRootAsync(options: DiscordModuleAsyncOptions): DynamicModule {
    return {
      module: DiscordModule,
      imports: options.imports || [],
      providers: [
        ...DiscordModule.createAsyncDiscordOptionProviders(options),
        MiddlewareResolver,
        GuardResolver,
        PipeResolver,
        ParamResolver,
        OnEventResolver,
        OnceEventResolver,
        OnCommandResolver,
        TransformParamResolver,
        ReflectMetadataProvider,
        DiscordHandlerService,
        DiscordAccessService,
        DiscordCatchService,
        DiscordClientProvider,
        DiscordResolverService,
        DiscordService,
        ClientResolver,
        TransformProvider,
        ValidationProvider,
        GuardClassResolver,
        PipeClassResolver
      ],
      exports: [DiscordClientProvider, TransformProvider, ValidationProvider],
    };
  }

  private static createDiscordOptionProvider(
    options: DiscordModuleOption,
  ): Provider {
    return {
      provide: ModuleConstant.DISCORD_MODULE_OPTIONS,
      useValue: options || {},
    };
  }

  private static createAsyncDiscordOptionProviders(
    options: DiscordModuleAsyncOptions,
  ): Provider[] {
    if (options) {
      if (options.useFactory) {
        return [{
          provide: ModuleConstant.DISCORD_MODULE_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject || [],
        }];
      } else {
        // For useClass and useExisting...
        const useClass = options.useClass as Type<DiscordOptionsFactory>;
        const providers: Provider[] = [
          {
            provide: ModuleConstant.DISCORD_MODULE_OPTIONS,
            useFactory: async (
              optionsFactory: DiscordOptionsFactory,
            ): Promise<DiscordModuleOption> =>
              optionsFactory.createDiscordOptions(),
            inject: [options.useExisting || options.useClass],
          }
        ];
        if (useClass) {
          providers.push({
            provide: useClass,
            useClass
          });
        }
        return providers;
      }
    } else {
      return [{
        provide: ModuleConstant.DISCORD_MODULE_OPTIONS,
        useValue: {},
      }];
    }
  }
}
