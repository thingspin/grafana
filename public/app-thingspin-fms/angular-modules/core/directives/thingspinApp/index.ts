import { GrafanaCtrl, grafanaAppDirective } from 'app/routes/GrafanaCtrl';
import { BackendSrv } from 'app/core/services/backend_srv';
import { TimeSrv } from 'app/features/dashboard/services/TimeSrv';
import DatasourceSrv from 'app/features/plugins/datasource_srv';
import { KeybindingSrv, coreModule } from 'app/core/core';
import { AngularLoader } from 'app/core/services/AngularLoader';

const isFms: any = false;

export class ThingspinCtrl extends GrafanaCtrl {
  /** @ngInject */
  constructor(
    $scope,
    utilSrv,
    $rootScope,
    $controller,
    contextSrv,
    bridgeSrv,
    backendSrv: BackendSrv,
    timeSrv: TimeSrv,
    datasourceSrv: DatasourceSrv,
    keybindingSrv: KeybindingSrv,
    angularLoader: AngularLoader
  ) {
    super(
      $scope,
      utilSrv,
      $rootScope,
      $controller,
      contextSrv,
      bridgeSrv,
      backendSrv,
      timeSrv,
      datasourceSrv,
      keybindingSrv,
      angularLoader
    );
  }
}

/** @ngInject */
export function thingspinAppDirective(playlistSrv, contextSrv, $timeout, $rootScope, $location) {
  return Object.assign(
    grafanaAppDirective(playlistSrv, contextSrv, $timeout, $rootScope, $location),
    isFms
      ? {
          controller: ThingspinCtrl,
          templateUrl: 'public/app-thingspin-fms/angular-modules/core/directives/thingspinApp/thingspinApp.html',
        }
      : {
          controller: ThingspinCtrl,
        }
  );
}

coreModule.directive('thingspinApp', thingspinAppDirective);
