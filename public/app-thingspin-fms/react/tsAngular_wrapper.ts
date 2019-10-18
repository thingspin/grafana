import { tsReact2AngularDirective } from 'app-thingspin-fms/angular-modules/thingspin/directives/tsReact2Angular';
import TsNavbarComponent from './components/Navbar';
import { TsLeftSidebar } from './components/LeftSidebar';
import { TsRightSidebar } from './components/RightSidebar';
import { TsBottombar } from './components/Bottombar';
import TsToolbarComponent from './components/MainView/Toobar/index';
import OpcNodeTree from './components/OpcNodeTree';

import { TsConfigs } from './views/system/configs';
import { TsDrone } from 'app-thingspin-fms/pro/drone';

export function tsRegisterAngularDirectives() {
  tsReact2AngularDirective('tsNavbar', TsNavbarComponent, []);
  tsReact2AngularDirective('tsLeftSidebar', TsLeftSidebar, []);
  tsReact2AngularDirective('tsRightSidebar', TsRightSidebar, []);
  tsReact2AngularDirective('tsBottombar', TsBottombar, []);
  tsReact2AngularDirective('tsToolbar', TsToolbarComponent, []);

  tsReact2AngularDirective('rcOpcTree', OpcNodeTree, [
    "flowId",
    "data",
    "activeKey",
    "initialActiveKey",
    "debounceTime",
    "initialOpenNodes",
    "locale",
    "children",
    "close",
    ["onClickItem", { watchDepth: 'reference', wrapApply: true }],
    ["onClickAdd",  { watchDepth: 'reference', wrapApply: true }],
  ]);
  tsReact2AngularDirective('tsConfigView', TsConfigs, []);
  tsReact2AngularDirective('tsDroneView', TsDrone, []);
}
