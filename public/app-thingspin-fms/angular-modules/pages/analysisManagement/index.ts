import angular from 'angular';

export class TsAnalysisManagementCtrl {
  /** @ngInject */
  constructor() {}
}
export function tsAlanysisMgmtDirective() {
  return {
    restrict: 'E',
    templateUrl: 'public/app-thingspin-fms/angular-modules/pages/analysisManagement/index.html',
    controller: TsAnalysisManagementCtrl,
    bindToController: true,
    controllerAs: 'ctrl',
    scope: {},
  };
}

angular.module('thingspin.directives').directive('tsAnalysisManagement', tsAlanysisMgmtDirective);
