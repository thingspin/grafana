import angular from 'angular';

export class TsPredAnlyCtrl {
  /** @ngInject */
  constructor() {}
}
export function tsPredAnlyDirective() {
  return {
    restrict: 'E',
    templateUrl: 'public/app-thingspin-fms/angular-modules/thingspin/pages/analysisManagement/predictionAnalysis/index.html',
    controller: TsPredAnlyCtrl,
    bindToController: true,
    controllerAs: 'ctrl',
    scope: {},
  };
}

angular.module('thingspin.directives').directive('tsPredictionAnalysis', tsPredAnlyDirective);
