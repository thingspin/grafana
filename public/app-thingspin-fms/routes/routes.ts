import 'app/routes/dashboard_loaders';

// Types
import { setupAngularRoutes } from 'app/routes/routes';

import 'app-thingspin-fms/angular-modules/pages';
//import TsDrone from 'app-thingspin-fms/pro';

/** @ngInject */
export function fmsSetupAngularRoutes($routeProvider, $locationProvider) {
  setupAngularRoutes($routeProvider, $locationProvider);

  // 여기서 프론트엔드 라우터를 추가하거나 덮어쓰기를 하세요.
  $routeProvider.when('/login', {
    templateUrl: 'public/app-thingspin-fms/partials/login.html',
    controller: 'LoginCtrl',
    pageClass: 'login-page sidemenu-hidden',
  })
    .when('/thingspin/manage/alarm', { template: '<ts-alarm-management />', })

    .when('/thingspin/manage/analysis', { template: '<ts-analysis-management />', })
    .when('/thingspin/manage/analysis/correlation', { template: '<ts-corr-analysis />', })
    .when('/thingspin/manage/analysis/pattern', { template: '<ts-pattern-analysis />', })
    .when('/thingspin/manage/analysis/prediction', { template: '<ts-prediction-analysis />', })
    .when('/thingspin/manage/analysis/script', { template: '<ts-script-analysis />', })

    .when('/thingspin/manage/data', { template: '<ts-data-management />', })
    .when('/thingspin/manage/data/connect', { template: '<ts-connect-management />', })
    .when('/thingspin/manage/data/connect/opcua', { template: '<ts-opcua-connect />', })
    .when('/thingspin/manage/data/connect/opcua/:id', { template: '<ts-opcua-connect />', })
    .when('/thingspin/manage/data/connect/modbus', { template: '<ts-modbus-connect />', })
    .when('/thingspin/manage/data/connect/modbus/:id', { template: '<ts-modbus-connect />', })
    .when('/thingspin/manage/data/connect/mqtt', { template: '<ts-mqtt-connect />', })
    .when('/thingspin/manage/data/connect/mqtt/:id', { template: '<ts-mqtt-connect />', })

    .when('/thingspin/manage/facility', { template: '<ts-facility-management />', })

    .when('/thingspin/manage/monitoring', { template: '<ts-facility-monitoring />', })

    .when('/thingspin/manage/system', { template: '<ts-system-management />', })
    .when('/thingspin/manage/system/user', { template: '<ts-user-management />', })
    .when('/thingspin/manage/system/menu', { template: '<ts-menu-management />', })

    .when('/thingspin/manage/view-edit-management', { template: '<ts-view-edit-management />', })

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
