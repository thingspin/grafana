// Grafana Modules
import coreModule from 'app/core/core_module';
import { SaveDashboardModalCtrl } from 'app/features/dashboard/components/SaveModals';

// ThingSPIN Cutom Angular Modules
import { AlarmDashboardSrv } from '../services/tsDashboardSrv';

// customize Grafana SaveDashboardModalCtrl angular controller
export class AlarmSaveDashboardModalCtrl extends SaveDashboardModalCtrl {
  protected dbSrv: AlarmDashboardSrv;

  /** @ngInject */
  constructor(dashboardSrv: AlarmDashboardSrv) {
    super(dashboardSrv);
    this.dbSrv = dashboardSrv;
  }

  // Override
  save(): any {
    if (!this.saveForm.$valid) {
      return;
    }

    const { saveVariables, saveTimerange, message } = this;
    const options = { saveVariables, saveTimerange, message, };

    const dashboard = this.dbSrv.getCurrent();
    const saveModel = dashboard.getSaveModelClone(options);

    this.isSaving = true;

    return this.dbSrv.alarmSave(saveModel, options).then(this.postSave.bind(this, options));
  }
}

export class TsSaveDashboardModalDirective implements angular.IDirective {
  restrict = 'E';
  templateUrl = require("./alarmSaveDashboardModal.html");
  controller = AlarmSaveDashboardModalCtrl;
  bindToController = true;
  controllerAs = 'ctrl';
  scope = {
    dismiss: '&',
  };
}

coreModule.directive('alarmSaveDashboardModal', [() => new TsSaveDashboardModalDirective()]);
