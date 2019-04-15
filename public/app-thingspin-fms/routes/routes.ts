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
  }).when('/thingspin-page/system-management/menu-management', {
    template: '<ts-menu-management />',
  });
}
