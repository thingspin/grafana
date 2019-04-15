import angular from 'angular';

export class TsFacilityMonitoringCtrl {
  /** @ngInject */
  constructor() {}
}
export function tsFacilityMonitoringDirective() {
  return {
    restrict: 'E',
    templateUrl: 'public/app-thingspin-fms/angular-modules/thingspin/pages/facilityMonitoring/index.html',
    controller: TsFacilityMonitoringCtrl,
    bindToController: true,
    controllerAs: 'ctrl',
    scope: {},
  };
}

angular.module('thingspin.directives').directive('tsFactilityMonitoring', tsFacilityMonitoringDirective);
