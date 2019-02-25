import './core/directives/thingspinApp';

import { tsRegisterAngularDirectives } from '../react/tsAngular_wrapper';
import './core/services/tsBackendSrv';
import { CustomCtrl } from './thingspin/directives/boilerplate/Custom';
import { TsSearchCtrl } from './thingspin/directives/boilerplate/AlreadyExistDirectiveOverride';

export { CustomCtrl, TsSearchCtrl, tsRegisterAngularDirectives };
