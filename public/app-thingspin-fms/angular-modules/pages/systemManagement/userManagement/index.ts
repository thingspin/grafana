import angular from 'angular';

export class TsUserManagementCtrl {
  /** @ngInject */
  constructor() {}
}
export function tsUserManagementDirective() {
  return {
    restrict: 'E',
    templateUrl: 'public/app-thingspin-fms/angular-modules/thingspin/pages/systemManagement/userManagement/index.html',
    controller: TsUserManagementCtrl,
    bindToController: true,
    controllerAs: 'ctrl',
    scope: {},
  };
}

angular.module('thingspin.directives').directive('tsUserManagement', tsUserManagementDirective);
