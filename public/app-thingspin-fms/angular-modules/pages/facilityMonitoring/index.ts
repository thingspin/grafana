import angular from 'angular';

export class TsFacilityMonitoringCtrl {
  /** @ngInject */
  constructor() {}
}

/** @ngInject */
export function tsFacilityMonitoringDirective() {
  return {
    restrict: 'E',
    templateUrl: require("./index.html"),
    controller: TsFacilityMonitoringCtrl,
    bindToController: true,
    controllerAs: 'ctrl',
    scope: {},
  };
}

angular.module('thingspin.directives').directive('tsFactilityMonitoring', tsFacilityMonitoringDirective);
