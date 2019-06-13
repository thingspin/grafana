// Grafana Modules
import coreModule from 'app/core/core_module';
import { SaveDashboardAsModalCtrl } from 'app/features/dashboard/components/SaveModals';

// ThingSPIN Cutom Angular Modules
import { TsDashboardSrv } from 'app-thingspin-fms/angular-modules/core/services/tsDashboardSrv';

// customize Grafana SaveDashboardAsModalCtrl angular controller
export class TsSaveDashboardAsModalCtrl extends SaveDashboardAsModalCtrl {
  tsDbSrv: TsDashboardSrv;

  /** @ngInject */
  constructor(dashboardSrv: TsDashboardSrv) {
    super(dashboardSrv);
    this.tsDbSrv = dashboardSrv;
  }

  // Override
  save(): any {
    if (!this.copyTags) {
      this.clone.tags = [];
    }
    return this.tsDbSrv.fmSave(this.clone, { folderId: this.folderId }).then(this.dismiss);
  }
}

export class TsSaveDashboardAsDirective implements angular.IDirective {
  restrict = 'E';
  templateUrl = require('./SaveDashboardAsModal.html');
  controller = TsSaveDashboardAsModalCtrl;
  bindToController = true;
  controllerAs = 'ctrl';
  scope = {
    dismiss: '&'
  };
}

coreModule.directive('fmSaveDashboardAsModal', [() => new TsSaveDashboardAsDirective()]);
