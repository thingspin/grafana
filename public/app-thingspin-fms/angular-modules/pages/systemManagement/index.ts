import angular from 'angular';

export class TsSystemManagementCtrl {
  /** @ngInject */
  constructor() {}
}

/** @ngInject */
export function tsSystemManagementDirective() {
  return {
    restrict: 'E',
    templateUrl: 'public/app-thingspin-fms/angular-modules/pages/systemManagement/index.html',
    controller: TsSystemManagementCtrl,
    bindToController: true,
    controllerAs: 'ctrl',
    scope: {},
  };
}

angular.module('thingspin.directives').directive('tsSystemManagement', tsSystemManagementDirective);
