import angular from 'angular';

export class TsAlarmNotiManagementCtrl {
  /** @ngInject */
  constructor() {}
}

/** @ngInject */
export function tsAlarmNotiDirective() {
  return {
    restrict: 'E',
    templateUrl: require("./index.html"),
    controller: TsAlarmNotiManagementCtrl,
    bindToController: true,
    controllerAs: 'ctrl',
    scope: {},
  };
}

angular.module('thingspin.directives').directive('tsAlarmNotification', tsAlarmNotiDirective);
