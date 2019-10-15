// js 3rd party libs
import React, { PureComponent } from 'react';

// Grafana Module
import { store } from 'app/store/store';
import { appEvents } from 'app/core/core';
import { connectWithStore } from 'app/core/utils/connectWithReduxStore';

// Thingspin libraires
import { TsCoreEvents } from 'app-thingspin-fms/types';
import { TsBaseProps } from 'app-thingspin-fms/models/common';
import { contextSrv } from 'app-thingspin-fms/angular-modules/core/services/tsContextSrv';

interface Props extends TsBaseProps {
  faviconPath: string;
}

export class TsIconLogo extends PureComponent<Props> {
  toggleMenu() {
    // ignore if we just made a location change, stops hiding sidemenu on double clicks of back button
    const timeSinceLocationChanged: number = new Date().getTime() - store.getState().location.lastUpdated;
    if (timeSinceLocationChanged < 1000) {
      return;
    }

    contextSrv.toggleSideMenu();
    appEvents.emit(TsCoreEvents.toggleSidemenu);
  }

  render() {
    return (
      <div className="ts-icon-logo">
        <button className="btn" onClick={this.toggleMenu}>
          <img src={this.props.faviconPath} alt="" />
        </button>
      </div>
    );
  }
}

const mapStateToProps = (state: any) => ({
  faviconPath: state.thingspinNavbar.faviconPath,
});

const mapDispatchToProps = {};

export default connectWithStore(TsIconLogo, mapStateToProps, mapDispatchToProps);
