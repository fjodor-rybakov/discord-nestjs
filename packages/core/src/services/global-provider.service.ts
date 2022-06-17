import { Injectable, InjectionToken } from '@nestjs/common';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';

import { DISCORD_APP_FILTER } from '../definitions/constants/discord-app-filter';
import { DISCORD_APP_GUARD } from '../definitions/constants/discord-app-guard';
import { DISCORD_APP_PIPE } from '../definitions/constants/discord-app-pipe';

class ProviderGroup {
  /**
   * Filters, pipes and guards
   */
  globalLifecycleParts: InstanceWrapper[] = [];

  /**
   * Other providers
   */
  restProviders: InstanceWrapper[] = [];
}

@Injectable()
export class GlobalProviderService {
  filterGlobalProviders(providers: InstanceWrapper[] = []): ProviderGroup {
    return providers.reduce(
      (providerGroup: ProviderGroup, instanceWrapper: InstanceWrapper) => {
        this.isGlobalToken(instanceWrapper.token)
          ? providerGroup.globalLifecycleParts.push(instanceWrapper)
          : providerGroup.restProviders.push(instanceWrapper);

        return providerGroup;
      },
      new ProviderGroup(),
    );
  }

  sortGlobalProviders(providers: InstanceWrapper[]): InstanceWrapper[] {
    return providers.sort((first: InstanceWrapper, second: InstanceWrapper) => {
      const priorityA = (first.token as string).split(':').at(1);
      const priorityB = (second.token as string).split(':').at(1);

      return parseInt(priorityA) - parseInt(priorityB);
    });
  }

  private isGlobalToken(token: InjectionToken): boolean {
    if (token && typeof token === 'string') {
      const [globalToken] = token.split(':');

      return [DISCORD_APP_PIPE, DISCORD_APP_GUARD, DISCORD_APP_FILTER].includes(
        globalToken,
      );
    }

    return false;
  }
}
