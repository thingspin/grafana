import angular from 'angular';

export class TsOpcUaConnectCtrl {
  /** @ngInject */
  constructor() {}
}
export function tsOpcUaConnectDirective() {
  return {
    restrict: 'E',
    templateUrl: 'public/app-thingspin-fms/angular-modules/pages/dataManagement/connectManagement/opcua/index.html',
    controller: TsOpcUaConnectCtrl,
    bindToController: true,
    controllerAs: 'ctrl',
    scope: {},
  };
}

angular.module('thingspin.directives').directive('tsOpcuaConnect', tsOpcUaConnectDirective);
