import angular from 'angular';

export class TsAlarmManagementCtrl {
  /** @ngInject */
  constructor() {}
}

/** @ngInject */
export function tsAlarmMgmtDirective() {
  return {
    restrict: 'E',
    templateUrl: 'public/app-thingspin-fms/angular-modules/pages/alarmManagement/index.html',
    controller: TsAlarmManagementCtrl,
    bindToController: true,
    controllerAs: 'ctrl',
    scope: {},
  };
}

angular.module('thingspin.directives').directive('tsAlarmManagement', tsAlarmMgmtDirective);
