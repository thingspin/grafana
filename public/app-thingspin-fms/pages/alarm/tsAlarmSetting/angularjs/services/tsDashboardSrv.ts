// 3rd party libs

// grafana libs
// Models
import { DashboardSrv } from 'app/features/dashboard/services/DashboardSrv';
import { coreModule } from 'app/core/core';
import { BackendSrv } from 'app/core/services/backend_srv';
import { appEvents } from 'app/core/app_events';
import { DashboardModel } from 'app/features/dashboard/state';

// Define Thingspin DashboardService interface
export interface AlarmDashboardSrv extends DashboardSrv {
  // [ 알람 ] customize methods
  alarmSaveDashboard(options?: { overwrite?: any; folderId?: any; makeEditable?: any },
    clone?: DashboardModel): any;// customized 'saveDashboard' method
  alarmSave(clone: any, options: any, isMenuSave?: boolean, parentMenuName?: string, ): any; // customized 'save' method
  alarmPostSave(clone: DashboardModel, data: { version: number; url: string }): any; // customized 'postSave' method
  alarmShowSaveAsModal(): void; // customized 'showSaveAsModal' method
  alarmShowSaveModal(): void; // customized 'showSaveModal' method
  alarmHandleSaveDashboardError(clone: any,
    options: { overwrite?: any },
    err: { data: { status: string; message: any }; isHandled: boolean }): any; // customized 'handleSaveDashboardError' method
  saveJSONAlarmDashboard(json: string): any;// customized 'saveJSONDashboard' method
}

// Override serivce class in AnularJs (DashboardSrv)
coreModule.decorator('dashboardSrv',
/** @ngInject */
($delegate: DashboardSrv, $rootScope: any,
  backendSrv: BackendSrv, $location: angular.ILocationService): AlarmDashboardSrv => {
  const self = $delegate as AlarmDashboardSrv; //force type assertion

  // Add class method
  self.alarmSaveDashboard = (options?, clone?) => {
    console.log(self);
    if (clone) {
      self.setCurrent(self.create(clone, self.dashboard.meta));
    }
    if (self.dashboard.meta.provisioned) {
      return self.showDashboardProvisionedModal();
    }

    if (!self.dashboard.meta.canSave && options.makeEditable !== true) {
      return Promise.resolve();
    }

    if (self.dashboard.title === '신규 알람') {
      return self.alarmShowSaveAsModal();
    }

    if (self.dashboard.version > 0) {
      return self.alarmShowSaveModal();
    }

    return self.save(self.dashboard.getSaveModelClone(), options);
  };

  // Add class method
  self.alarmShowSaveAsModal = () => {
    $rootScope.appEvent('show-modal', {
      templateHtml: '<alarm-save-dashboard-as-modal dismiss="dismiss()"></alarm-save-dashboard-as-modal>',
      modalClass: 'modal--narrow',
    });
  };

  // Add class method
  self.alarmShowSaveModal = () => {
    $rootScope.appEvent('show-modal', {
      templateHtml: '<alarm-save-dashboard-modal dismiss="dismiss()"></alarm-save-dashboard-modal>',
      modalClass: 'modal--narrow',
    });
  };

  // Add class method
  self.alarmSave = async (clone, options, isMenuSave = false, parentMenuName) => {
    options = options || {};
    options.folderId = options.folderId >= 0 ? options.folderId : self.dashboard.meta.folderId || clone.folderId;

    let data: any;
    try {
      data = await backendSrv.saveDashboard(clone, options);
      data = await self.alarmPostSave(clone, data);
    } catch (e) {
      self.alarmHandleSaveDashboardError(clone, options, e);
    }

    return data;
  };

  // Add class method
  self.alarmPostSave = async (clone, data) => {
    self.dashboard.version = data.version;

    $rootScope.appEvent('dashboard-saved', self.dashboard);
    $rootScope.appEvent('alert-success', ['알람이 저장되었습니다.']);

    const [, , uid, slug] = data.url.split("/");
    const newUrl = `/thingspin/alarm/${uid}/${slug}`;
    const currentPath = $location.path();

    if (newUrl !== currentPath) {
      $location.url(newUrl).replace();
      $rootScope.$apply();
    }

    return self.dashboard;
  };

  // Add class method
  self.alarmHandleSaveDashboardError = (clone: any,
    options: { overwrite?: any },
    err: { data: { status: string; message: any }; isHandled: boolean }
  ) => {
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
          self.alarmSave(clone, options);
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
          self.alarmSave(clone, options);
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
          self.alarmShowSaveAsModal();
        },
        onConfirm: () => {
          self.alarmSave(clone, { overwrite: true });
        },
      });
    }
  };

  // Add class method
  self.saveJSONAlarmDashboard = (json: string) => {
      return self.alarmSave(JSON.parse(json), {});
  };

  appEvents.on('save-alarm-dashboard', self.alarmSaveDashboard.bind(self), $rootScope);

  return self;
});
