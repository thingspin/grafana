import angular, { IScope, ILocationService, ITimeoutService } from 'angular';

import { SearchCtrl } from 'app/core/components/search/search';
import { SearchSrv } from 'app/core/services/search_srv';

export class TsSearchCtrl extends SearchCtrl {
  /** @ngInject */
  constructor($scope: IScope, $location: ILocationService, $timeout: ITimeoutService, searchSrv: SearchSrv) {
    super($scope, $location, $timeout, searchSrv);
  }
}
export function tsSearchDirective() {
  return {
    restrict: 'E',
    templateUrl: 'public/app/core/components/search/search.html',
    controller: TsSearchCtrl,
    bindToController: true,
    controllerAs: 'ctrl',
    scope: {},
  };
}

angular.module('thingspin.directives').directive('tsDashboardSearch', tsSearchDirective);
