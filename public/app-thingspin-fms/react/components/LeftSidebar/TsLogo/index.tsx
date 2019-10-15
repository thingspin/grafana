// React PureComponent
import React, { PureComponent } from 'react';

// Grafana Module
import { store } from 'app/store/store';
import { appEvents } from 'app/core/core';

// Thingspin libs
import { TsCoreEvents } from 'app-thingspin-fms/types';
import { EViewModeState } from 'app-thingspin-fms/models/common';
import { contextSrv } from 'app-thingspin-fms/angular-modules/core/services/tsContextSrv';

interface Props {
  viewMode: EViewModeState;
}

class TsLogo extends PureComponent<Props> {
  title = `ThingSPIN`;
  fullLogoPath = `public/img/thingspin/thingspin_logo_gray.svg`;
  smallLogoPath: string;
  viewMode: EViewModeState = this.props.viewMode;

  toggleMenu() {
    // ignore if we just made a location change, stops hiding sidemenu on double clicks of back button
    const timeSinceLocationChanged = new Date().getTime() - store.getState().location.lastUpdated;
    if (timeSinceLocationChanged < 1000) {
      return;
    }

    contextSrv.toggleSideMenu();
    appEvents.emit(TsCoreEvents.toggleSidemenu);
  }

  render() {
    switch (this.viewMode) {
      case EViewModeState.Mode2:
        return <div key="viewMode2"> </div>;
      case EViewModeState.Mode1:
        return (
          <div className="ts-leftsidebar-logo" onClick={this.toggleMenu} key="viewMode1">
            <img src={this.smallLogoPath} alt={this.title} />
          </div>
        );
      default:
        return (
          <div className="ts-leftsidebar-logo" onClick={this.toggleMenu} key="viewMode0">
            <img src={this.fullLogoPath} alt={this.title} />
          </div>
        );
    }
  }
}

export default TsLogo;
