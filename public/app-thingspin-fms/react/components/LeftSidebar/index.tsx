import React, { PureComponent } from 'react';
import TsLogo from './TsLogo';
import TsMenu from './TsMenu';
import { EViewModeState } from 'app-thingspin-fms/models/common';

export class TsLeftSidebar extends PureComponent {
  viewMode: EViewModeState;

  constructor(props) {
    super(props);
    this.viewMode = EViewModeState.Mode0;
  }

  render() {
    return [
      <TsLogo key="tslogo" viewMode={this.viewMode} />,
      <div className="fms-menu-dividers" key="ts-dividers">
        <hr className="fms-menu-dividers-divider" key="ts-divider" />
      </div>,
      <TsMenu key="tsmenu" />,
    ];
  }
}
