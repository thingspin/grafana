import angular from 'angular';

export class TsConnectManagementCtrl {
  /** @ngInject */
  constructor() {}
}
export function tsConnectManagementDirective() {
  return {
    restrict: 'E',
    templateUrl: 'public/app-thingspin-fms/angular-modules/thingspin/pages/dataManagement/connectManagement/index.html',
    controller: TsConnectManagementCtrl,
    bindToController: true,
    controllerAs: 'ctrl',
    scope: {},
  };
}

angular.module('thingspin.directives').directive('tsConnectManagement', tsConnectManagementDirective);
