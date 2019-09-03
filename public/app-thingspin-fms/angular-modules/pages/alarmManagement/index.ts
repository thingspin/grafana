import angular from 'angular';
import "./index.scss";

export class TsAlarmManagementCtrl {
  /** @ngInject */
  constructor() {}
}

/** @ngInject */
export function tsAlarmMgmtDirective() {
  return {
    restrict: 'E',
    templateUrl: require("./index.html"),
    controller: TsAlarmManagementCtrl,
    bindToController: true,
    controllerAs: 'ctrl',
    scope: {},
  };
}

angular.module('thingspin.directives').directive('tsAlarmManagement', tsAlarmMgmtDirective);
