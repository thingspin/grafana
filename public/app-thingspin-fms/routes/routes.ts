import 'app/routes/dashboard_loaders';

// Grafana libs
import ChangePasswordPage from 'app/features/profile/ChangePasswordPage';
import UsersListPage from 'app/features/users/UsersListPage';

// Types
import { DashboardRouteInfo } from 'app/types';
import { setupAngularRoutes } from 'app/routes/routes';

// thingspin Registrations
import 'app-thingspin-fms/angular-modules/pages';
import { UserSettingInfo } from 'app-thingspin-fms/types';
import FMComponent from 'app-thingspin-fms/pages/FacilityMonitoring/react';
import TsAlarmRuleList from 'app-thingspin-fms/pages/alarm/tsAlarmRuleList';
import TsAlarmSettingComponent from 'app-thingspin-fms/pages/alarm/tsAlarmSetting';
import { TsLoginPage } from 'app-thingspin-fms/pages/login/TsLoginPage';

/** @ngInject */
export function fmsSetupAngularRoutes($routeProvider: any, $locationProvider: angular.ILocationProvider) {
  setupAngularRoutes($routeProvider, $locationProvider);

  // 여기서 프론트엔드 라우터를 추가하거나 덮어쓰기를 하세요.
  $routeProvider
  // LOGIN / SIGNUP
  .when('/login', {
    template: '<react-container/>',
    resolve: {
      component: () => TsLoginPage,
    },
    pageClass: 'login-page sidemenu-hidden',
  })
  .when('/thingspin/manage/alarm', {
    template: '<ts-alarm-management />',
    routeInfo: {
      menupath: [ UserSettingInfo.Alarm ],
      icon: 'fa fa-bell',
    },
  })
  //.when('/thingspin/manage/alarm/new', { template: '<ts-alarm-new />', })
  //.when('/thingspin/manage/alarm/management', { template: '<ts-alarm-management />', })
  .when('/thingspin/manage/alarm/notification', { template: '<ts-alarm-notification />', })
  //.when('/thingspin/manage/alarm/setting', { template: '<ts-alarm-setting />', })
  //.when('/thingspin/manage/alarm/history', { template: '<ts-alarm-history />', })


  .when('/thingspin/manage/analysis', { template: '<ts-analysis-management />', })
  .when('/thingspin/manage/analysis/correlation', { template: '<ts-corr-analysis />', })
  .when('/thingspin/manage/analysis/pattern', { template: '<ts-pattern-analysis />', })
  .when('/thingspin/manage/analysis/prediction', { template: '<ts-prediction-analysis />', })
  .when('/thingspin/manage/analysis/script', { template: '<ts-script-analysis />', })

  // 데이터 관리 페이지
  .when('/thingspin/manage/data', { template: '<ts-data-management />', })
  // 연결 관리
  .when('/thingspin/manage/data/connect', { template: '<ts-connect-management />', })
  .when('/thingspin/manage/data/connect/opcua', { template: '<ts-opcua-connect />', })
  .when('/thingspin/manage/data/connect/opcua/:id', { template: '<ts-opcua-connect />', })
  .when('/thingspin/manage/data/connect/modbus', { template: '<ts-modbus-connect />', })
  .when('/thingspin/manage/data/connect/modbus/:id', { template: '<ts-modbus-connect />', })
  .when('/thingspin/manage/data/connect/mqtt', { template: '<ts-mqtt-connect />', })
  .when('/thingspin/manage/data/connect/mqtt/:id', { template: '<ts-mqtt-connect />', })
  // 사이트 관리
  .when('/thingspin/manage/data/site', { template: '<ts-site-list />', })
  .when('/thingspin/manage/data/site/:id', { template: '<ts-tag-define />', })

  // Facility Mangement
  .when('/thingspin/manage/facility', { template: '<ts-facility-management />', })

  // 설비 모니터링
  .when('/thingspin/manage/monitoring', {
    template: '<react-container />',
    pageClass: 'page-dashboard',
    routeInfo: DashboardRouteInfo.New,
    reloadOnSearch: false,
    resolve: {
      component: () => FMComponent,
    },
  })
  .when('/thingspin/manage/monitoring/:uid/:slug', {
    template: '<react-container />',
    pageClass: 'page-dashboard',
    routeInfo: DashboardRouteInfo.Normal,
    reloadOnSearch: false,
    resolve: {
      component: () => FMComponent,
    },
  })

  // 시스템 관리
  .when('/thingspin/manage/system', { template: '<ts-system-management />', })
  // 사용자 관리
  .when('/thingspin/manage/system/user', {
    template: '<react-container />',
    resolve: {
      component: () => UsersListPage,
    },
  })
  // 메뉴 관리
  .when('/thingspin/manage/system/menu', { template: '<ts-menu-management />', })

  .when('/thingspin/manage/view-edit-management', { template: '<ts-view-edit-management />', })
  // Alarm Management
  .when('/thingspin/alarm/new', {
    template: '<react-container />',
    pageClass: 'page-dashboard',
    routeInfo: DashboardRouteInfo.New,
    reloadOnSearch: false,
    resolve: {
      component: () => TsAlarmSettingComponent,
    },
  })
  .when('/thingspin/alarm', { // customized /alert/list in file app/routes/routes.ts
    template: '<react-container />',
    reloadOnSearch: false,
    resolve: {
      component: () => TsAlarmRuleList,
    },
  })
  // Right Navbar
  .when('/thingspin/user/profile', {
    templateUrl: 'public/app/features/profile/partials/profile.html',
    routeInfo: {
      menupath: [UserSettingInfo.Profile],
      icon: 'gicon gicon-preferences',
    },
    controller: 'ProfileCtrl',
    controllerAs: 'ctrl',
  })
  .when('/thingspin/user/profile/password', {
    template: '<react-container />',
    resolve: {
      component: () => ChangePasswordPage,
    },
    routeInfo: {
      menupath: [UserSettingInfo.Profile, "비밀번호 변경"],
      icon: 'fa fa-fw fa-lock',
    },
  })
  .when('/thingspin/user/profile/select-org', {
    templateUrl: 'public/app/features/org/partials/select_org.html',
    routeInfo: {
      menupath: [UserSettingInfo.Profile],
      icon: 'tsi icon-ts-settings',
    },
    controller: 'SelectOrgCtrl',
  })

  .when('/v1.0/sys/config', { template: '<ts-config-view />', })
  .when('/v1.0/sys/config/:mode', { template: '<ts-config-view />', action: { view: 'solo'}})
  .when('/drone', { template: '<ts-drone-view />', })
  .when('/drone/', { template: '<ts-drone-view />', })
  .when('/drone/:meta', { template: '<ts-drone-view />', })
  .when('/drone/:meta/:id', { template: '<ts-drone-view />', })
  .when('/drone/:meta/:id/:mode', {
    template: '<ts-drone-view />',
    action: { view: 'solo'}
  });
}
