// Grafana Modules
import coreModule from 'app/core/core_module';
import { SaveDashboardAsModalCtrl } from 'app/features/dashboard/components/SaveModals';

// ThingSPIN Cutom Angular Modules
import { AlarmDashboardSrv } from '../services/tsDashboardSrv';
import { FMDashboardModel } from 'app-thingspin-fms/pages/FacilityMonitoring/models';

// customize Grafana SaveDashboardAsModalCtrl angular controller
export class AlarmSaveDashboardAsModalCtrl extends SaveDashboardAsModalCtrl {
  protected _dashboardSrv: AlarmDashboardSrv;

  /** @ngInject */
  constructor(dashboardSrv: AlarmDashboardSrv) {
    super(dashboardSrv);
    this._dashboardSrv = dashboardSrv;
  }

  // Override
  save(): any {
    const dashboard: FMDashboardModel = this.clone;
    if (!this.copyTags) {
      dashboard.tags = [];
    }
    dashboard.panels[0].alert.name = dashboard.title;

    return this._dashboardSrv.alarmSave(dashboard,
      { folderId: this.folderId },
      true,
      '알람',
    ).then(this.dismiss);
  }
}

export class AlarmSaveDashboardAsDirective implements angular.IDirective {
  restrict = 'E';
  templateUrl = require('./alarmSaveDashboardAsModal.html');
  controller = AlarmSaveDashboardAsModalCtrl;
  bindToController = true;
  controllerAs = 'ctrl';
  scope = {
    dismiss: '&'
  };
}

coreModule.directive('alarmSaveDashboardAsModal', [() => new AlarmSaveDashboardAsDirective()]);
