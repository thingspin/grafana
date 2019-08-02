import { IScope } from 'angular';

import { BackendSrv } from 'app/core/services/backend_srv';
import { TsContextSrv } from 'app-thingspin-fms/angular-modules/core/services/tsContextSrv';

import config from 'app/core/config';

import coreModule from '../../core/core_module';

export class ExtPageCtrl {
  toolUrl: any;

  /** @ngInject */
  constructor(private $sce: any, $scope: IScope, $routeParams: any, contextSrv: TsContextSrv, backendSrv: BackendSrv) {
    contextSrv.sidemenu = false;

    const sys = $routeParams.sys;

    const remote = (config as any)['companions'][sys];
    this.toolUrl = this.$sce.trustAsResourceUrl(remote);
  }
}

coreModule.controller('ExtPageCtrl', ExtPageCtrl);
