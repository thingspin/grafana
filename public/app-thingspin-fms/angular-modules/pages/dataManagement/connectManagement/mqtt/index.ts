import angular from 'angular';

export class TsMqttConnectCtrl {
  /** @ngInject */
  constructor() {}
}

/** @ngInject */
export function tsMqttConnectDirective() {
  return {
    restrict: 'E',
    templateUrl: require("./index.html"),
    controller: TsMqttConnectCtrl,
    bindToController: true,
    controllerAs: 'ctrl',
    scope: {},
  };
}

angular.module('thingspin.directives').directive('tsMqttConnect', tsMqttConnectDirective);
