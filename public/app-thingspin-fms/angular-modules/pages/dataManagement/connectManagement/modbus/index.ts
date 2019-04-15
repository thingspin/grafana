import angular from 'angular';

export class TsModbusConnectCtrl {
  /** @ngInject */
  constructor() {}
}

/** @ngInject */
export function tsModbusConnectDirective() {
  return {
    restrict: 'E',
    templateUrl: 'public/app-thingspin-fms/angular-modules/pages/dataManagement/connectManagement/modbus/index.html',
    controller: TsModbusConnectCtrl,
    bindToController: true,
    controllerAs: 'ctrl',
    scope: {},
  };
}

angular.module('thingspin.directives').directive('tsModbusConnect', tsModbusConnectDirective);
