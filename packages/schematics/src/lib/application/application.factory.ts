import { strings } from '@angular-devkit/core';
import {
  Rule,
  SchematicContext,
  SchematicsException,
  Tree,
  apply,
  chain,
  mergeWith,
  move,
  template,
  url,
} from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';

import { ApplicationSchema } from './application.schema';
import { TemplateOption } from './enum/template-option';

export function main(options: ApplicationSchema): Rule {
  return chain([generateTemplate(options), installDependencies(options)]);
}

function generateTemplate(options: ApplicationSchema): Rule {
  if (!options.name)
    throw new SchematicsException('Option (name) is required.');

  const templateSource = apply(url(getPathByTemplate(options.template)), [
    template({
      ...strings,
      ...options,
    }),
    move(options.name),
  ]);

  return mergeWith(templateSource);
}

function installDependencies(options: ApplicationSchema): Rule {
  return (host: Tree, context: SchematicContext) => {
    context.addTask(
      new NodePackageInstallTask({
        packageManager: options.packageManager,
        workingDirectory: options.name,
      }),
    );
    context.logger.log('info', `🔍 Installing packages...`);

    return host;
  };
}

function getPathByTemplate(template: TemplateOption): string {
  switch (template) {
    case TemplateOption.SLASH_COMMAND:
      return './files/command';
    case TemplateOption.PREFIX_COMMAND:
      return './files/prefix-command-command';
    default:
      throw new SchematicsException('Unknown template option.');
  }
}
