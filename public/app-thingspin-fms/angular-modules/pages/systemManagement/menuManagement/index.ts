import angular from 'angular';

export class TsMenuManagementCtrl {
  /** @ngInject */
  constructor() {}
}

/** @ngInject */
export function tsMenuManagementDirective() {
  return {
    restrict: 'E',
    templateUrl: require("./index.html"),
    controller: TsMenuManagementCtrl,
    bindToController: true,
    controllerAs: 'ctrl',
    scope: {},
  };
}

angular.module('thingspin.directives').directive('tsMenuManagement', tsMenuManagementDirective);
