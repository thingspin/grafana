import angular from 'angular';

export class CustomCtrl {
  /** @ngInject */
  constructor() {}
}
export function tsCustomDirective() {
  return {
    restrict: 'E',
    templateUrl: 'public/app-thingspin-fms/angular-modules/thingspin/directives/boilerplate/Custom/index.html',
    controller: CustomCtrl,
    bindToController: true,
    controllerAs: 'ctrl',
    scope: {},
  };
}

angular.module('thingspin.directives').directive('custom', tsCustomDirective);
