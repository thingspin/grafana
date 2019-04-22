import React, { PureComponent } from 'react';
import { connectWithStore } from 'app/core/utils/connectWithReduxStore';

import { EViewModeState } from 'app-thingspin-fms/models/common';
import { TsBaseProps } from 'app-thingspin-fms/models/common';
import TsLogo from './TsLogo';
import TsMenu from './TsMenu';

export interface Props extends TsBaseProps {
}

export class TsLeftSidebar extends PureComponent<Props> {
  viewMode: EViewModeState = EViewModeState.Mode0;

  render() {
    return [
      <TsLogo key="tslogo" viewMode={this.viewMode} />,
      <div className="fms-menu-dividers" key="ts-dividers">
        <hr className="fms-menu-dividers-divider" key="ts-divider" />
      </div>,
      <div className="fms-menu-container" key="fms-menu-container">
        <TsMenu key="tsmenu" {...this.props} />
      </div>,
    ];
  }
}

const mapStateToProps = () => ({});
const mapDispatchToProps = {};

export default connectWithStore(TsLeftSidebar, mapStateToProps, mapDispatchToProps);
