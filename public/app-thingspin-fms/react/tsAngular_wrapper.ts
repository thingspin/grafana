import { tsReact2AngularDirective } from 'app-thingspin-fms/angular-modules/thingspin/directives/tsReact2Angular';
import { TsLeftSidebar } from './components/LeftSidebar/index';

export function tsRegisterAngularDirectives() {
  tsReact2AngularDirective('tsLeftSidebar', TsLeftSidebar, []);
}
