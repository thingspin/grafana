import angular from 'angular';

export class TsPatternAnlyCtrl {
  /** @ngInject */
  constructor() {}
}

/** @ngInject */
export function tsPatternAnlyDirective() {
  return {
    restrict: 'E',
    templateUrl: require("./index.html"),
    controller: TsPatternAnlyCtrl,
    bindToController: true,
    controllerAs: 'ctrl',
    scope: {},
  };
}

angular.module('thingspin.directives').directive('tsPatternAnalysis', tsPatternAnlyDirective);
