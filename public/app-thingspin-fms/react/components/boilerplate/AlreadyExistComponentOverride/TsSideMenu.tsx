import React from 'react';
import { SideMenu } from 'app/core/components/sidemenu/SideMenu';
import { store } from 'app/store/store';
import { contextSrv } from 'app-thingspin-fms/angular-modules/core/services/tsContextSrv';
import { appEvents } from 'app/core/core';

export class TsSideMenu extends SideMenu {
  toggleSideMenu = () => {
    // ignore if we just made a location change, stops hiding sidemenu on double clicks of back button
    const timeSinceLocationChanged = new Date().getTime() - store.getState().location.lastUpdated;
    if (timeSinceLocationChanged < 1000) {
      return;
    }

    contextSrv.toggleSideMenu();
    appEvents.emit('toggle-sidemenu');
  };

  render() {
    return [
      <div className="sidemenu__logo" onClick={this.toggleSideMenu} key="logo">
        <img src="public/img/thingspin/thingspin_icon.png" alt="ThingSPIN" />
      </div>,
      <div className="sidemenu__logo_small_breakpoint" onClick={this.toggleSideMenuSmallBreakpoint} key="hamburger">
        <i className="fa fa-bars" />
        <span className="sidemenu__close">
          <i className="fa fa-times" />
          &nbsp;Close
        </span>
      </div>,
    ];
  }
}
