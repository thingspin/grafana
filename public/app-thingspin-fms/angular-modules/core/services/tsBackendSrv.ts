import { BackendSrv } from 'app/core/services/backend_srv';
import { coreModule } from 'app/core/core';

export class TsBackendSrv extends BackendSrv { }

coreModule.service('backendSrv', TsBackendSrv);
