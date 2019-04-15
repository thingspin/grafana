import angular from 'angular';

export class TsViewEditManagementCtrl {
  /** @ngInject */
  constructor() {}
}

/** @ngInject */
export function tsViewEditManagementDirective() {
  return {
    restrict: 'E',
    templateUrl: 'public/app-thingspin-fms/angular-modules/pages/viewEditManagement/index.html',
    controller: TsViewEditManagementCtrl,
    bindToController: true,
    controllerAs: 'ctrl',
    scope: {},
  };
}

angular.module('thingspin.directives').directive('tsViewEditManagement', tsViewEditManagementDirective);
