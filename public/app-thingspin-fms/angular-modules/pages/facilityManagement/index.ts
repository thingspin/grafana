import angular from 'angular';

export class TsFacilityManagementCtrl {
  /** @ngInject */
  constructor() {}
}

/** @ngInject */
export function tsFacilityManagementDirective() {
  return {
    restrict: 'E',
    templateUrl: 'public/app-thingspin-fms/angular-modules/pages/facilityManagement/index.html',
    controller: TsFacilityManagementCtrl,
    bindToController: true,
    controllerAs: 'ctrl',
    scope: {},
  };
}

angular.module('thingspin.directives').directive('tsFactilityManagement', tsFacilityManagementDirective);
