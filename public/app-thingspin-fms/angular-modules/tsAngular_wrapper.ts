import { tsReact2AngularDirective } from 'app-thingspin-fms/utils/tsReact2Angular';
import { SideMenu } from 'app/core/components/sidemenu/SideMenu';

export function tsRegisterAngularDirectives() {
  tsReact2AngularDirective('tsSidemenu', SideMenu, []);
}
