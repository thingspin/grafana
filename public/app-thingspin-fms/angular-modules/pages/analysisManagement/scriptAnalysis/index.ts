import angular from 'angular';

export class TsScriptAnlyCtrl {
  /** @ngInject */
  constructor() {}
}
export function tsScriptAnlyDirective() {
  return {
    restrict: 'E',
    templateUrl: 'public/app-thingspin-fms/angular-modules/pages/analysisManagement/scriptAnalysis/index.html',
    controller: TsScriptAnlyCtrl,
    bindToController: true,
    controllerAs: 'ctrl',
    scope: {},
  };
}

angular.module('thingspin.directives').directive('ts-script-analysis', tsScriptAnlyDirective);
