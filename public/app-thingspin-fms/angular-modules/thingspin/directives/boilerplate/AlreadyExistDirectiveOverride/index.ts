// import angular from 'angular';
import { SearchCtrl } from 'app/core/components/search/search';
// import { coreModule } from 'app/core/core';
// import { multipleDirectiveSelector } from '../../tsReact2Angular';

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

// angular.module('thingspin.directives').directive('dashboardSearch', tsSearchDirective);
// // directive가 여러개가 정의 된 경우 사용자 선택 directive 사용
// coreModule.decorator('dashboardSearchDirective', multipleDirectiveSelector);
