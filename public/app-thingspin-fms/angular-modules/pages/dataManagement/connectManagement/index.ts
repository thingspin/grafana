import angular from 'angular';

export class TsConnectManagementCtrl {
  /** @ngInject */
  constructor() {}
}

/** @ngInject */
export function tsConnectManagementDirective() {
  return {
    restrict: 'E',
    templateUrl: require('./index.html'),
    controller: TsConnectManagementCtrl,
    bindToController: true,
    controllerAs: 'ctrl',
    scope: {},
  };
}

angular.module('thingspin.directives').directive('tsConnectManagement', tsConnectManagementDirective);
