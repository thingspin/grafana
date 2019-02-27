import 'app/routes/dashboard_loaders';
import 'app/routes/ReactContainer';
import { applyRouteRegistrationHandlers } from 'app/routes/registry';

// Types
import { setupAngularRoutes } from 'app/routes/routes';

/** @ngInject */
export function fmsSetupAngularRoutes($routeProvider, $locationProvider) {
  setupAngularRoutes($routeProvider, $locationProvider);

  $locationProvider.html5Mode(true);
  $routeProvider
    .when('/login', {
      templateUrl: 'public/app-thingspin-fms/partials/login.html',
      controller: 'LoginCtrl',
      pageClass: 'login-page sidemenu-hidden',
    });

  applyRouteRegistrationHandlers($routeProvider);
}
