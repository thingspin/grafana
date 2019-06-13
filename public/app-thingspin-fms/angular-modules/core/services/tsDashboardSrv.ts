import { DashboardSrv } from 'app/features/dashboard/services/DashboardSrv';
import { coreModule } from 'app/core/core';
import { BackendSrv } from 'app/core/services/backend_srv';
// import location_util from 'app/core/utils/location_util';

// Define Thingspin DashboardService interface
export interface TsDashboardSrv extends DashboardSrv {
  // [ 설비 모니터링 ] customize methods
  fmSaveFM(options?, clone?);// customized 'saveDashboard' method
  fmSave(clone, options); // customized 'save' method
  fmPostSave(clone, data); // customized 'postSave' method
  fmShowSaveAsModal(); // customized 'showSaveAsModal' method
  fmShowSaveModal(); // customized 'showSaveModal' method
  fmHandleSaveDashboardError(clone, options, err); // customized 'handleSaveDashboardError' method
}

// Override serivce class in AnularJs (DashboardSrv)
coreModule.decorator('dashboardSrv', ($delegate: DashboardSrv, $rootScope,
  backendSrv: BackendSrv, $location: angular.ILocationService): TsDashboardSrv => {
  const self: TsDashboardSrv = $delegate as TsDashboardSrv; //force type assertion

  // Add class method
  self.fmSaveFM = (options?, clone?) => {
    if (clone) {
      self.setCurrent(self.create(clone, self.dashboard.meta));
    }
    if (self.dashboard.meta.provisioned) {
      return self.showDashboardProvisionedModal();
    }

    if (!self.dashboard.meta.canSave && options.makeEditable !== true) {
      return Promise.resolve();
    }

    if (self.dashboard.title === '신규 설비 모니터링') {
      return self.fmShowSaveAsModal();
    }

    if (self.dashboard.version > 0) {
      return self.fmShowSaveModal();
    }

    return self.save(self.dashboard.getSaveModelClone(), options);
  };

  // Add class method
  self.fmShowSaveAsModal = () => {
    $rootScope.appEvent('show-modal', {
      templateHtml: '<fm-save-dashboard-as-modal dismiss="dismiss()"></fm-save-dashboard-as-modal>',
      modalClass: 'modal--narrow',
    });
  };

  // Add class method
  self.fmShowSaveModal = () => {
    $rootScope.appEvent('show-modal', {
      templateHtml: '<fm-save-dashboard-modal dismiss="dismiss()"></fm-save-dashboard-modal>',
      modalClass: 'modal--narrow',
    });
  };

  // Add class method
  self.fmSave = (clone, options) => {
    options = options || {};
    options.folderId = options.folderId >= 0 ? options.folderId : self.dashboard.meta.folderId || clone.folderId;

    return backendSrv
      .saveDashboard(clone, options)
      .then(self.fmPostSave.bind(self, clone))
      .catch(self.fmHandleSaveDashboardError.bind(self, clone, options));
  };

  // Add class method
  self.fmPostSave = (clone, data) => {
    self.dashboard.version = data.version;

    $rootScope.appEvent('dashboard-saved', self.dashboard);
    $rootScope.appEvent('alert-success', ['신규 설비모니터링이 추가되었습니다.']);

    const [, , uid, slug] = data.url.split("/");
    const newUrl = `/thingspin/manage/monitoring/${uid}/${slug}`;
    const currentPath = $location.path();

    if (newUrl !== currentPath) {
      $location.url(newUrl).replace();
    }

    return self.dashboard;
  };

  // Add class method
  self.fmHandleSaveDashboardError = (clone, options, err) => {
    options = options || {};
    options.overwrite = true;

    if (err.data && err.data.status === 'version-mismatch') {
      err.isHandled = true;

      $rootScope.appEvent('confirm-modal', {
        title: 'Conflict',
        text: 'Someone else has updated this dashboard.',
        text2: 'Would you still like to save this dashboard?',
        yesText: 'Save & Overwrite',
        icon: 'fa-warning',
        onConfirm: () => {
          self.fmSave(clone, options);
        },
      });
    }

    if (err.data && err.data.status === 'name-exists') {
      err.isHandled = true;

      $rootScope.appEvent('confirm-modal', {
        title: 'Conflict',
        text: 'A dashboard with the same name in selected folder already exists.',
        text2: 'Would you still like to save this dashboard?',
        yesText: 'Save & Overwrite',
        icon: 'fa-warning',
        onConfirm: () => {
          self.fmSave(clone, options);
        },
      });
    }

    if (err.data && err.data.status === 'plugin-dashboard') {
      err.isHandled = true;

      $rootScope.appEvent('confirm-modal', {
        title: 'Plugin Dashboard',
        text: err.data.message,
        text2: 'Your changes will be lost when you update the plugin. Use Save As to create custom version.',
        yesText: 'Overwrite',
        icon: 'fa-warning',
        altActionText: 'Save As',
        onAltAction: () => {
          self.fmShowSaveAsModal();
        },
        onConfirm: () => {
          self.fmSave(clone, { overwrite: true });
        },
      });
    }
  };

  return self;
});
