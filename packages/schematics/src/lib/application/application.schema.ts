import { TemplateOption } from './enum/template-option';

export interface ApplicationSchema {
  /**
   * Your application name
   */
  name: string;

  /**
   * Application template
   */
  template: TemplateOption;

  /**
   * Package manager
   */
  packageManager: 'npm' | 'yarn' | 'pnpm';
}
