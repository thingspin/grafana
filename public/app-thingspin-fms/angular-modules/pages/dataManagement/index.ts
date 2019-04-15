import angular from 'angular';

export class TsDataManagementCtrl {
  /** @ngInject */
  constructor() {}
}

/** @ngInject */
export function tsDataManagementDirective() {
  return {
    restrict: 'E',
    templateUrl: require("./index.html"),
    controller: TsDataManagementCtrl,
    bindToController: true,
    controllerAs: 'ctrl',
    scope: {},
  };
}

angular.module('thingspin.directives').directive('tsDataManagement', tsDataManagementDirective);
