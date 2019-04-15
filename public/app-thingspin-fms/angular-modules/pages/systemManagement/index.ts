import angular from 'angular';

export class TsSystemManagementCtrl {
  /** @ngInject */
  constructor() {}
}

/** @ngInject */
export function tsSystemManagementDirective() {
  return {
    restrict: 'E',
    templateUrl: require("./index.html"),
    controller: TsSystemManagementCtrl,
    bindToController: true,
    controllerAs: 'ctrl',
    scope: {},
  };
}

angular.module('thingspin.directives').directive('tsSystemManagement', tsSystemManagementDirective);
