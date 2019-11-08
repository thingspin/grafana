import { coreModule } from "app/core/core";

export class TsAnalyticsTab implements angular.IController {
  ctrl: any;

  /** @ngInject */
  constructor($scope: any) {
    this.ctrl = $scope.ctrl;
  }
}

export class TsAnalyticsTabDirective implements angular.IDirective {
  templateUrl = require('./tsAnalyticsTab.html');
  restrict = 'E';
  scope = true;
  controller = TsAnalyticsTab;
}

coreModule.directive('tsAnalyticsTab', [() => new TsAnalyticsTabDirective()]);
