import { tsReact2AngularDirective } from 'app-thingspin-fms/angular-modules/thingspin/directives/tsReact2Angular';
import { TsNavbar } from './components/Navbar/index';
import { TsLeftSidebar } from './components/LeftSidebar/index';
import { TsRightSidebar } from './components/RightSidebar/index';
import { TsMainView } from './components/MainView/index';
import { TsBottombar } from './components/Bottombar/index';

export function tsRegisterAngularDirectives() {
  tsReact2AngularDirective('tsNavbar', TsNavbar, []);
  tsReact2AngularDirective('tsLeftSidebar', TsLeftSidebar, []);
  tsReact2AngularDirective('tsRightSidebar', TsRightSidebar, []);
  tsReact2AngularDirective('tsMainView', TsMainView, []);
  tsReact2AngularDirective('tsBottombar', TsBottombar, []);
}
