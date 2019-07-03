import coreModule from '../../core/core_module';
import config from 'app/core/config';

export class ExtPageCtrl {
  toolUrl: any;

  /** @ngInject */
  constructor(private $sce, $scope, $routeParams, contextSrv, backendSrv) {
    contextSrv.sidemenu = false;

    const sys = $routeParams.sys;

    const remote = config['companions'][sys];
    this.toolUrl = this.$sce.trustAsResourceUrl(remote);
  }
}

coreModule.controller('ExtPageCtrl', ExtPageCtrl);
