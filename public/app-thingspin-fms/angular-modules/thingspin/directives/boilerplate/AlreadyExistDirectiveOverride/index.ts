import angular, { IScope, ILocationService, ITimeoutService } from 'angular';

import { coreModule } from 'app/core/core';
import { SearchCtrl } from 'app/core/components/search/search';
import { SearchSrv } from 'app/core/services/search_srv';

import { multipleDirectiveSelector } from '../../tsReact2Angular';

export class TsSearchCtrl extends SearchCtrl {
  /** @ngInject */
  constructor($scope: IScope, $location: ILocationService, $timeout: ITimeoutService, searchSrv: SearchSrv) {
    super($scope, $location, $timeout, searchSrv);
  }
}

/** @ngInject */
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

angular.module('thingspin.directives').directive('dashboardSearch', tsSearchDirective);
// directive가 여러개가 정의 된 경우 사용자 선택 directive 사용
coreModule.decorator('dashboardSearchDirective', multipleDirectiveSelector);
