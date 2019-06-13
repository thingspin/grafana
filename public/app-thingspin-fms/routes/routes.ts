import 'app/routes/dashboard_loaders';

// Types
import { setupAngularRoutes } from 'app/routes/routes';

import 'app-thingspin-fms/angular-modules/pages';

// thingspin Registrations
import { UserSettingInfo } from 'app-thingspin-fms/types';
import FMComponent from 'app-thingspin-fms/pages/FacilityMonitoring/react';
import { DashboardRouteInfo } from 'app/types';

/** @ngInject */
export function fmsSetupAngularRoutes($routeProvider, $locationProvider) {
  setupAngularRoutes($routeProvider, $locationProvider);

  // 여기서 프론트엔드 라우터를 추가하거나 덮어쓰기를 하세요.
  $routeProvider.when('/login', {
    templateUrl: 'public/app-thingspin-fms/partials/login.html',
    controller: 'LoginCtrl',
    pageClass: 'login-page sidemenu-hidden',
  })
    .when('/thingspin/manage/alarm', {
      template: '<ts-alarm-management />',
      routeInfo: {
        menupath: [UserSettingInfo.Alarm],
        icon: 'fa fa-bell',
      },
    })

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
    .when('/thingspin/manage/data/site', { template: '<ts-site-management />', })

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
    .when('/thingspin/manage/system/user', { template: '<ts-user-management />', })
    // 메뉴 관리
    .when('/thingspin/manage/system/menu', { template: '<ts-menu-management />', })

    .when('/thingspin/manage/view-edit-management', { template: '<ts-view-edit-management />', })
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
      templateUrl: 'public/app/features/profile/partials/change_password.html',
      routeInfo: {
        menupath: [UserSettingInfo.Profile],
        icon: 'fa fa-fw fa-lock',
      },
      controller: 'ChangePasswordCtrl',
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
