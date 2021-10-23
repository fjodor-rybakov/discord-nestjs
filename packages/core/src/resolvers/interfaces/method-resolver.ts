import { MethodResolveOptions } from './method-resolve-options';

export interface MethodResolver {
  resolve(options: MethodResolveOptions): Promise<void> | void;
}
