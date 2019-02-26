import 'app/routes/dashboard_loaders';
import 'app/routes/ReactContainer';

// Types
import { setupAngularRoutes } from 'app/routes/routes';

/** @ngInject */
export function fmsSetupAngularRoutes($routeProvider, $locationProvider) {
  setupAngularRoutes($routeProvider, $locationProvider);
}
