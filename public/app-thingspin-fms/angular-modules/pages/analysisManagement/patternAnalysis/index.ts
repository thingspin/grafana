import angular from 'angular';

export class TsPatternAnlyCtrl {
  /** @ngInject */
  constructor() {}
}
export function tsPatternAnlyDirective() {
  return {
    restrict: 'E',
    templateUrl: 'public/app-thingspin-fms/angular-modules/thingspin/pages/analysisManagement/patternAnalysis/index.html',
    controller: TsPatternAnlyCtrl,
    bindToController: true,
    controllerAs: 'ctrl',
    scope: {},
  };
}

angular.module('thingspin.directives').directive('tsPatternAnalysis', tsPatternAnlyDirective);
