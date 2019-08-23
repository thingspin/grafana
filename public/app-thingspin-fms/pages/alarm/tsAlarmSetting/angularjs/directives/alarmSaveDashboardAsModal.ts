// Grafana Modules
import coreModule from 'app/core/core_module';
import { SaveDashboardAsModalCtrl } from 'app/features/dashboard/components/SaveModals';

// ThingSPIN Cutom Angular Modules
import { AlarmDashboardSrv } from '../services/tsDashboardSrv';

// customize Grafana SaveDashboardAsModalCtrl angular controller
export class AlarmSaveDashboardAsModalCtrl extends SaveDashboardAsModalCtrl {
  protected tsDbSrv: AlarmDashboardSrv;

  /** @ngInject */
  constructor(dashboardSrv: AlarmDashboardSrv) {
    super(dashboardSrv);
    this.tsDbSrv = dashboardSrv;
  }

  // Override
  save(): any {
    if (!this.copyTags) {
      this.clone.tags = [];
    }

    return this.tsDbSrv.alarmSave(this.clone,
      { folderId: this.folderId },
      true,
      '알람'
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
