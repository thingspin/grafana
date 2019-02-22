import { tsReact2AngularDirective } from 'app-thingspin-fms/angular-modules/thingspin/directives/tsReact2Angular';

import { TsSideMenu } from 'app-thingspin-fms/angular-modules/react/components/boilerplate/AlreadyExistComponentOverride/TsSideMenu';
import { TsCustomTag } from './components/boilerplate/TsCustomTag/TsCustomTag';

export function tsRegisterAngularDirectives() {
  tsReact2AngularDirective('sidemenu', TsSideMenu, []);
  tsReact2AngularDirective('tsCustomTag', TsCustomTag, []);
}
