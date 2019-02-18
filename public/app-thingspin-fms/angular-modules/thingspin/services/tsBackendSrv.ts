import { BackendSrv } from 'app/core/services/backend_srv';
import { coreModule } from 'app/core/core';

export class TsBackendSrv extends BackendSrv {
  constructor($http, $q, $timeout, contextSrv) {
    super($http, $q, $timeout, contextSrv);
    console.log(this);
  }
}

coreModule.service('backendSrv', TsBackendSrv);
