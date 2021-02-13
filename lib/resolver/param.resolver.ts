import { Injectable } from '@nestjs/common';
import { ReflectMetadataProvider } from '../provider/reflect-metadata.provider';
import { PropertyResolveOptions } from './interface/property-resolve-options';
import { DiscordParamList } from './interface/discord-param-list';
import { DecoratorParamType } from '../constant/decorator-param-type';
import { DecoratorTypeArg } from './interface/decorator-type-arg';
import { ApplyPropertyOption } from './interface/apply-property-option';

@Injectable()
export class ParamResolver {
  private readonly params: DiscordParamList[] = [];

  constructor(
    private readonly metadataProvider: ReflectMetadataProvider,
  ) {}

  resolve(options: PropertyResolveOptions) {
    const {instance, methodName} = options;
    const contentMetadata = this.metadataProvider.getContentDecoratorMetadata(
      instance,
      methodName,
    );
    const contextMetadata = this.metadataProvider.getContextDecoratorMetadata(
      instance,
      methodName,
    );
    if (!contentMetadata && !contextMetadata) {
      return;
    }
    const paramsTypes = this.metadataProvider.getParamTypesMetadata(
      instance,
      methodName,
    );
    if (!paramsTypes) {
      return;
    }
    const paramItem: DiscordParamList = {
      instance,
      methodName,
      args: []
    };
    if (contentMetadata) {
      paramItem.args[contentMetadata.parameterIndex] = {
        decoratorType: DecoratorParamType.CONTENT,
        paramType: paramsTypes[contentMetadata.parameterIndex]
      };
    }
    if (contextMetadata) {
      paramItem.args[contextMetadata.parameterIndex] = {
        decoratorType: DecoratorParamType.CONTEXT
      };
    }
    this.params.push(paramItem);
  }

  applyParam(options: ApplyPropertyOption): any[] {
    const {instance, methodName, content, context} = options;
    const paramsList = this.params.find((item: DiscordParamList) =>
      item.instance === instance && item.methodName === methodName
    );
    if (!paramsList) {
      return;
    }
    return paramsList.args.map((arg: DecoratorTypeArg) => {
      switch (arg.decoratorType) {
        case DecoratorParamType.CONTENT:
          // TODO: add create dto
          return content;
        case DecoratorParamType.CONTEXT:
          return context;
      }
    });
  }

  private initContent(instance: any, inputData: string) {
    const inputPart = inputData.split(' ');
    for (const propKey in instance) {
      const metadata = this.metadataProvider.getArgNumDecoratorMetadata(
        instance,
        propKey,
      );
      if (metadata) {
        instance[propKey] = inputPart[metadata.position];
      }
    }
    return instance;
  }
}