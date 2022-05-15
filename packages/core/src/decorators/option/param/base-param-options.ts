export interface BaseParamOptions {
  /**
   * Option description
   */
  description: string;

  /**
   * Sets a new name for the option
   * The default is the name of the property being decorated
   */
  name?: string;

  /**
   * Is required option
   */
  required?: boolean;
}
