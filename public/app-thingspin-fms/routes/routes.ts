import 'app/routes/dashboard_loaders';

// Types
import { setupAngularRoutes } from 'app/routes/routes';

import 'app-thingspin-fms/angular-modules/pages';

/** @ngInject */
export function fmsSetupAngularRoutes($routeProvider, $locationProvider) {
  setupAngularRoutes($routeProvider, $locationProvider);

  // 여기서 프론트엔드 라우터를 추가하거나 덮어쓰기를 하세요.
  $routeProvider.when('/login', {
    templateUrl: 'public/app-thingspin-fms/partials/login.html',
    controller: 'LoginCtrl',
    pageClass: 'login-page sidemenu-hidden',
  })
    .when('/thingspin-page/alarm-management', { template: '<ts-alarm-management />', })

    .when('/thingspin-page/analysis-management', { template: '<ts-analysis-management />', })
    .when('/thingspin-page/analysis-management/correlation-analysis', { template: '<ts-corr-analysis />', })
    .when('/thingspin-page/analysis-management/pattern-analysis', { template: '<ts-pattern-analysis />', })
    .when('/thingspin-page/analysis-management/predition-analysis', { template: '<ts-prediction-analysis />', })
    .when('/thingspin-page/analysis-management/scrip-analysis', { template: '<ts-script-analysis />', })

    .when('/thingspin-page/data-management', { template: '<ts-data-management />', })
    .when('/thingspin-page/data-management/connect-management', { template: '<ts-connect-management />', })
    .when('/thingspin-page/data-management/connect-management/opcua', { template: '<ts-opcua-connect />', })
    .when('/thingspin-page/data-management/connect-management/modbus', { template: '<ts-modbus-connect />', })
    .when('/thingspin-page/data-management/connect-management/mqtt', { template: '<ts-mqtt-connect />', })

    .when('/thingspin-page/facility-management', { template: '<ts-facility-management />', })

    .when('/thingspin-page/facility-monitoring', { template: '<ts-facility-monitoring />', })

    .when('/thingspin-page/system-management', { template: '<ts-system-management />', })
    .when('/thingspin-page/system-management/user-management', { template: '<ts-user-management />', })
    .when('/thingspin-page/system-management/menu-management', { template: '<ts-menu-management />', })

    .when('/thingspin-page/view-edit-management', { template: '<ts-view-edit-management />', });
}
