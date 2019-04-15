import angular from 'angular';

export class TsUserManagementCtrl {
  /** @ngInject */
  constructor() {}
}

/** @ngInject */
export function tsUserManagementDirective() {
  return {
    restrict: 'E',
    templateUrl: require("./index.html"),
    controller: TsUserManagementCtrl,
    bindToController: true,
    controllerAs: 'ctrl',
    scope: {},
  };
}

angular.module('thingspin.directives').directive('tsUserManagement', tsUserManagementDirective);
