import React, { PureComponent } from 'react';

// Grafana Module
import { store } from 'app/store/store';
import { appEvents } from 'app/core/core';

// Thingspin libraires
import { TsBaseProps } from 'app-thingspin-fms/models/common';
import { contextSrv } from 'app-thingspin-fms/angular-modules/core/services/tsContextSrv';

interface Props extends TsBaseProps {
  imgagePath: string;
}

export class TsIconLogo extends PureComponent<Props> {
  constructor(props) {
    super(props);
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
    return (
      <div className="ts-icon-logo">
        <button className="btn" onClick={this.toggleMenu}>
          <img src={this.props.imgagePath} alt="" />
        </button>
      </div>
    );
  }
}
