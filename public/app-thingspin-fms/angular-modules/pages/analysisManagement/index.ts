import angular from 'angular';

export class TsAnalysisManagementCtrl {
  /** @ngInject */
  constructor() {}
}

/** @ngInject */
export function tsAlanysisMgmtDirective() {
  return {
    restrict: 'E',
    templateUrl: require("./index.html"),
    controller: TsAnalysisManagementCtrl,
    bindToController: true,
    controllerAs: 'ctrl',
    scope: {},
  };
}

angular.module('thingspin.directives').directive('tsAnalysisManagement', tsAlanysisMgmtDirective);
