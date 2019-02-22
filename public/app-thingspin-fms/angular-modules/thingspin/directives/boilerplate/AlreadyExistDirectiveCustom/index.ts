import angular from 'angular';
import { SearchCtrl } from 'app/core/components/search/search';

export class TsSearchCtrl extends SearchCtrl {
  /** @ngInject */
  constructor($scope, $location, $timeout, searchSrv) {
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
