import { tsRegisterAngularDirectives } from './react/tsAngular_wrapper';
import './core/services/tsBackendSrv';
import { CustomCtrl } from './thingspin/directives/boilerplate/Custom';
import { TsSearchCtrl } from './thingspin/directives/boilerplate/AlreadyExistDirectiveOverride';

import '../ng2Modules/app.module';

export { CustomCtrl, TsSearchCtrl, tsRegisterAngularDirectives };
