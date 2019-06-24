// Grafana Modules
import coreModule from 'app/core/core_module';
import { SaveDashboardModalCtrl } from 'app/features/dashboard/components/SaveModals';

// ThingSPIN Cutom Angular Modules
import { TsDashboardSrv } from 'app-thingspin-fms/angular-modules/core/services/tsDashboardSrv';

// customize Grafana SaveDashboardModalCtrl angular controller
export class TsSaveDashboardModalCtrl extends SaveDashboardModalCtrl {
  protected dbSrv: TsDashboardSrv;

  /** @ngInject */
  constructor(dashboardSrv: TsDashboardSrv) {
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

    return this.dbSrv.fmSave(saveModel, options).then(this.postSave.bind(this, options));
  }
}

export class TsSaveDashboardModalDirective implements angular.IDirective {
  restrict = 'E';
  templateUrl = require("./SaveDashboardModal.html");
  controller = TsSaveDashboardModalCtrl;
  bindToController = true;
  controllerAs = 'ctrl';
  scope = {
    dismiss: '&',
  };
}

coreModule.directive('fmSaveDashboardModal', [() => new TsSaveDashboardModalDirective()]);
