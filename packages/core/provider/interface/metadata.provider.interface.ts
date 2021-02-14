import { OnCommandDecoratorOptions } from '../../decorator/interface/on-command-decorator-options';
import { OnDecoratorOptions } from '../../decorator/interface/on-decorator-options';
import { MiddlewareOptions } from '../../decorator/interface/middleware-options';
import { ClientDecoratorOptions } from '../../decorator/interface/client-decorator-options';
import { ArgNumOptions } from '../../decorator/interface/arg-num-options';
import { DiscordParamDecoratorType } from '../../decorator/interface/param-decorator-type';
import { PipeType } from '../../util/type/pipe-type';
import { GuardType } from '../../util/type/guard-type';
import { ArgRangeOptions } from '../../decorator/interface/arg-range-options';

export interface MetadataProvider {
  /**
   * Getting metadata from @Command decorator
   */
  getOnCommandDecoratorMetadata(instance: unknown, methodName: string): OnCommandDecoratorOptions;

  /**
   * Getting metadata from @On decorator
   */
  getOnMessageDecoratorMetadata(instance: unknown, methodName: string): OnDecoratorOptions;

  /**
   * Getting metadata from @Once decorator
   */
  getOnceMessageDecoratorMetadata(instance: unknown, methodName: string): OnDecoratorOptions;

  /**
   * Getting metadata from @Middleware decorator
   */
  getMiddlewareDecoratorMetadata(instance: unknown): MiddlewareOptions;

  /**
   * Getting metadata from @UsePipes decorator
   */
  getUsePipesDecoratorMetadata(instance: unknown, methodName: string): PipeType[];

  /**
   * Getting metadata from @UseGuards decorator
   */
  getUseGuardsDecoratorMetadata(instance: unknown, methodName: string): GuardType[];

  /**
   * Getting metadata from @UseGuards decorator
   */
  getClientDecoratorMetadata(instance: unknown, propertyKey: string): ClientDecoratorOptions;

  /**
   * Getting metadata from @ArgNum decorator
   */
  getArgNumDecoratorMetadata(instance: unknown, propertyKey: string): (last: number) => ArgNumOptions;

  /**
   * Getting metadata from @ArgRange decorator
   */
  getArgRangeDecoratorMetadata(instance: unknown, propertyKey: string): (last: number) => ArgRangeOptions;

  /**
   * Getting metadata from @Content decorator
   */
  getContentDecoratorMetadata(instance: unknown, methodName: string): DiscordParamDecoratorType;

  /**
   * Getting metadata from @Context decorator
   */
  getContextDecoratorMetadata(instance: unknown, methodName: string): DiscordParamDecoratorType;

  /**
   * Getting metadata from @Context decorator
   */
  getParamTypesMetadata(instance: unknown, methodName: string): any[];
}