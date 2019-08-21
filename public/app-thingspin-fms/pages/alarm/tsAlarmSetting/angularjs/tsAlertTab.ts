// Grafana libs
import { coreModule } from 'app/core/core';
import { AlertTabCtrl } from 'app/features/alerting/AlertTabCtrl';

export class TsAlertTabCtrl extends AlertTabCtrl {

}

/** @ngInject */
export function tsAlertTab() {
  'use strict';
  return {
    restrict: 'E',
    scope: true,
    templateUrl: require('./tsAlertTab.html'),
    controller: TsAlertTabCtrl,
  };
}

coreModule.directive('tsAlertTab', tsAlertTab);
