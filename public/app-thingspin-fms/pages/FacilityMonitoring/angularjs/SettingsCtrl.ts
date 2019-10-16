// external libraires
import _ from 'lodash';

// Grafana Modules
import { coreModule, } from 'app/core/core';
import { BackendSrv } from 'app/core/services/backend_srv';
import { SettingsCtrl } from 'app/features/dashboard/components/DashboardSettings';

// ThingSPIN Modules
import { TsDashboardSrv } from 'app-thingspin-fms/angular-modules/core/services/tsDashboardSrv';
import { GrafanaRootScope } from 'app/routes/GrafanaCtrl';

// customize Grafana SettingsCtrl angular controller
export class TsSettingsCtrl extends SettingsCtrl {
  protected dbSrv: TsDashboardSrv;
  protected ngRoute: angular.route.IRouteService;

  /** @ngInject */
  constructor(
    $scope: angular.IScope,
    $route: angular.route.IRouteService,
    $location: angular.ILocationService,
    $rootScope: GrafanaRootScope,
    backendSrv: BackendSrv,
    dashboardSrv: TsDashboardSrv) {
    super($scope, $route, $location, $rootScope, backendSrv, dashboardSrv);

    this.dbSrv = dashboardSrv;
    this.ngRoute = $route;
  }

  // Override
  saveDashboard(): void {
    this.dbSrv.fmSaveFM();
  }

  // Override
  saveDashboardJson() {
    this.dbSrv.saveJSONFmDashboard(this.json).then(() => {
      this.ngRoute.reload();
    });
  }

  // Override
  openSaveAsModal(): void {
    this.dbSrv.fmShowSaveAsModal();
  }
}

export class TsDashboardSettings implements angular.IDirective {
  restrict = 'E';
  templateUrl = require('./Settings.html');
  controller = TsSettingsCtrl;
  bindToController = true;
  controllerAs = 'ctrl';
  transclude = true;
  scope = {
    dashboard: '='
  };
}

coreModule.directive('fmDashboardSettings', [() => new TsDashboardSettings()]);
