import { tsReact2AngularDirective } from 'app-thingspin-fms/angular-modules/thingspin/directives/tsReact2Angular';
import { TsNavbarComponent } from './components/Navbar';
import { TsLeftSidebar } from './components/LeftSidebar';
import { TsRightSidebar } from './components/RightSidebar';
import { TsBottombar } from './components/Bottombar';

export function tsRegisterAngularDirectives() {
  tsReact2AngularDirective('tsNavbar', TsNavbarComponent, []);
  tsReact2AngularDirective('tsLeftSidebar', TsLeftSidebar, []);
  tsReact2AngularDirective('tsRightSidebar', TsRightSidebar, []);
  tsReact2AngularDirective('tsBottombar', TsBottombar, []);
}
