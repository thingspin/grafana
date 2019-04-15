import angular from 'angular';

export class TsMqttConnectCtrl {
  /** @ngInject */
  constructor() {}
}
export function tsMqttConnectDirective() {
  return {
    restrict: 'E',
    templateUrl: 'public/app-thingspin-fms/angular-modules/thingspin/pages/dataManagement/connectManagement/mqtt/index.html',
    controller: TsMqttConnectCtrl,
    bindToController: true,
    controllerAs: 'ctrl',
    scope: {},
  };
}

angular.module('thingspin.directives').directive('tsMqttConnect', tsMqttConnectDirective);
