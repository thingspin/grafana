import { tsReact2AngularDirective } from 'app-thingspin-fms/utils/tsReact2Angular';

import { TsSideMenu } from 'app-thingspin-fms/react/components/TsSideMenu';

export function tsRegisterAngularDirectives() {
  tsReact2AngularDirective('tsSidemenu', TsSideMenu, []);
}
