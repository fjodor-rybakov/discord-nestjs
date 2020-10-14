export const isClassDecorator = (target: any): boolean => {
  return typeof target === 'function';
};
