import angular from 'angular';

export class TsCorrAnlyCtrl {
  /** @ngInject */
  constructor() {}
}

/** @ngInject */
export function tsCorrAnlyDirective() {
  return {
    restrict: 'E',
    templateUrl: 'public/app-thingspin-fms/angular-modules/pages/analysisManagement/correlationAnalysis/index.html',
    controller: TsCorrAnlyCtrl,
    bindToController: true,
    controllerAs: 'ctrl',
    scope: {},
  };
}

angular.module('thingspin.directives').directive('tsCorrAnalysis', tsCorrAnlyDirective);
