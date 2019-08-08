import { BackendSrv } from 'app/core/services/backend_srv';
import { coreModule } from 'app/core/core';
import { IHttpService, IQService, ITimeoutService } from 'angular';
import { ContextSrv } from 'app/core/services/context_srv';

export class TsBackendSrv extends BackendSrv {
  /** @ngInject */
  constructor($http: IHttpService, $q: IQService, $timeout: ITimeoutService, contextSrv: ContextSrv) {
    super($http, $q, $timeout, contextSrv);
  }
}

coreModule.service('backendSrv', TsBackendSrv);
