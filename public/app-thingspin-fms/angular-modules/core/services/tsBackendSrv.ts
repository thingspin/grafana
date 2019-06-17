import { BackendSrv } from 'app/core/services/backend_srv';
import { coreModule } from 'app/core/core';

export class TsBackendSrv extends BackendSrv {
  /** @ngInject */
  constructor($http, $q, $timeout, contextSrv) {
    super($http, $q, $timeout, contextSrv);
  }
}

coreModule.service('backendSrv', TsBackendSrv);
