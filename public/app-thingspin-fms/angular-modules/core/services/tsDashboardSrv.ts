// 3rd party libs
import { ILocationService } from 'angular';

// grafana libs
import { DashboardSrv } from 'app/features/dashboard/services/DashboardSrv';
import { coreModule } from 'app/core/core';
import { BackendSrv } from 'app/core/services/backend_srv';
import config from 'app/core/config';
import { store } from 'app/store/store';
import { updateTsMenu } from 'app-thingspin-fms/react/redux/dispayches/tsMenu';
import { appEvents } from 'app/core/app_events';
// import location_util from 'app/core/utils/location_util';

// Define Thingspin DashboardService interface
export interface TsDashboardSrv extends DashboardSrv {
  // [ 설비 모니터링 ] customize methods
  fmSaveFM(options?, clone?);// customized 'saveDashboard' method
  fmSave(clone, options, isMenuSave?: boolean, parentMenuName?: string, ); // customized 'save' method
  fmPostSave(clone, data); // customized 'postSave' method
  fmSaveMenu(clone, data, parentMenuName?: string);
  fmShowSaveAsModal(); // customized 'showSaveAsModal' method
  fmShowSaveModal(); // customized 'showSaveModal' method
  fmHandleSaveDashboardError(clone, options, err); // customized 'handleSaveDashboardError' method
  saveJSONFmDashboard(json);// customized 'saveJSONDashboard' method
}

// Override serivce class in AnularJs (DashboardSrv)
coreModule.decorator('dashboardSrv', ($delegate: DashboardSrv, $rootScope,
  backendSrv: BackendSrv, $location: ILocationService): TsDashboardSrv => {
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
  self.fmSave = async (clone, options, isMenuSave = false, parentMenuName) => {
    options = options || {};
    options.folderId = options.folderId >= 0 ? options.folderId : self.dashboard.meta.folderId || clone.folderId;

    let data: any;
    try {
      data = await backendSrv.saveDashboard(clone, options);
      console.log(data);
      if (isMenuSave) {
        data = await self.fmSaveMenu(clone, data, parentMenuName);
      }
      data = await self.fmPostSave(clone, data);
    } catch (e) {
      self.fmHandleSaveDashboardError(clone, options, e);
    }

    return data;
  };

  // Add class method
  self.fmPostSave = async (clone, data) => {
    self.dashboard.version = data.version;

    $rootScope.appEvent('dashboard-saved', self.dashboard);
    $rootScope.appEvent('alert-success', ['설비모니터링이 저장되었습니다.']);

    const [, , uid, slug] = data.url.split("/");
    const newUrl = `/thingspin/manage/monitoring/${uid}/${slug}`;
    const currentPath = $location.path();

    if (newUrl !== currentPath) {
      $location.url(newUrl).replace();
      $rootScope.$apply();
    }

    return self.dashboard;
  };

  // Add class method
  self.fmSaveMenu = async (clone, data, parentMenuName = '설비 모니터링') => {
    const baseApi = `/thingspin/menu`;
    const { orgId } = config.bootData.user;

    const parentMenu: any[] = await backendSrv.get(`${baseApi}/${orgId}/name/${parentMenuName}`);
    if (!parentMenu.length) {
      // not found menu
      return self.dashboard;
    } else if (parentMenu.length !== 1) {
      // found menus
    }

    const [, , uid, slug] = data.url.split("/");
    await backendSrv.post(`${baseApi}/${orgId}/${parentMenu[0].mbid}`, {
      text: clone.title,
      url: `/thingspin/manage/monitoring/${uid}/${slug}`,
      dashboardId: data.id,
      dashboardUid: uid,
    });

    store.dispatch(updateTsMenu(orgId));

    return data;
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

  // Add class method
  self.saveJSONFmDashboard = (json) => {
      return self.fmSave(JSON.parse(json), {});
  };

  appEvents.on('save-fm-dashboard', self.fmSaveFM.bind(self), $rootScope);

  return self;
});
