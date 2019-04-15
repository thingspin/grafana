import angular from 'angular';

export class TsFacilityManagementCtrl {
  /** @ngInject */
  constructor() {}
}

/** @ngInject */
export function tsFacilityManagementDirective() {
  return {
    restrict: 'E',
    templateUrl: require("./index.html"),
    controller: TsFacilityManagementCtrl,
    bindToController: true,
    controllerAs: 'ctrl',
    scope: {},
  };
}

angular.module('thingspin.directives').directive('tsFactilityManagement', tsFacilityManagementDirective);
