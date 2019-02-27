// React PureComponent
import React, { PureComponent } from 'react';
// Grafana Module
import { store } from 'app/store/store';
// import { contextSrv, appEvents } from 'app/core/core';
import { EViewModeState } from 'app-thingspin-fms/models/common';
import { appEvents, contextSrv } from 'app/core/core';

interface Props {
  viewMode: EViewModeState;
}

class TsLogo extends PureComponent<Props> {
  title: string;
  fullLogoPath: string;
  smallLogoPath: string;
  viewMode: EViewModeState;

  constructor(props) {
    super(props);
    this.title = `ThingSPIN`;
    this.fullLogoPath = `public/img/thingspin_icon.svg`;
    this.viewMode = props.viewMode;
  }

  changeLogo() {
    // ignore if we just made a location change, stops hiding sidemenu on double clicks of back button
    const timeSinceLocationChanged = new Date().getTime() - store.getState().location.lastUpdated;
    if (timeSinceLocationChanged < 1000) {
      return;
    }

    this.viewMode = this.viewMode === EViewModeState.Mode2 ? 0 : this.viewMode + 1;
    this.setState({ key: `viewMode${this.viewMode}` });
  }

  toggleMenu() {
    // ignore if we just made a location change, stops hiding sidemenu on double clicks of back button
    const timeSinceLocationChanged = new Date().getTime() - store.getState().location.lastUpdated;
    if (timeSinceLocationChanged < 1000) {
      return;
    }

    contextSrv.toggleSideMenu();
    appEvents.emit('toggle-sidemenu');
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
