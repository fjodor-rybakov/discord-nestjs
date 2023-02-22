export interface CommandListenerDescribe {
  name: string;

  group?: string;

  subName?: string;

  instance: InstanceType<any>;

  methodName: string;
}
