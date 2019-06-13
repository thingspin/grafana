// external libraires
import _ from 'lodash';

// Grafana Modules
import { coreModule, } from 'app/core/core';
import { SettingsCtrl } from 'app/features/dashboard/components/DashboardSettings';

// ThingSPIN Modules
import { TsDashboardSrv } from 'app-thingspin-fms/angular-modules/core/services/tsDashboardSrv';
import { BackendSrv } from 'app/core/services/backend_srv';

// customize Grafana SettingsCtrl angular controller
export class TsSettingsCtrl extends SettingsCtrl {
  dbSrv: TsDashboardSrv;

  /** @ngInject */
  constructor(
    $scope: angular.IScope,
    $route: angular.route.IRouteService,
    $location: angular.ILocationService,
    $rootScope,
    backendSrv: BackendSrv,
    dashboardSrv: TsDashboardSrv) {
    super($scope, $route, $location, $rootScope, backendSrv, dashboardSrv);

    this.dbSrv = dashboardSrv;
  }

  // Override
  saveDashboard(): void {
    this.dbSrv.fmSaveFM();
  }

  // Override
  openSaveAsModal(): void {
    this.dbSrv.fmShowSaveAsModal();
  }
}

export class TsDashboardSettings implements angular.IDirective {
  restrict = 'E';
  templateUrl = 'public/app/features/dashboard/components/DashboardSettings/template.html';
  controller = TsSettingsCtrl;
  bindToController = true;
  controllerAs = 'ctrl';
  transclude = true;
  scope = {
    dashboard: '='
  };
}

coreModule.directive('fmDashboardSettings', [() => new TsDashboardSettings()]);
