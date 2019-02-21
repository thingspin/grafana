import React from 'react';
import { SideMenu } from 'app/core/components/sidemenu/SideMenu';

export class TsSideMenu extends SideMenu {
  render() {
    return [
      <div className="sidemenu__logo" onClick={this.toggleSideMenu} key="logo">
        <img src="public/img/thingspin_icon.svg" alt="ThingSPIN" />
      </div>,
      <div className="sidemenu__logo_small_breakpoint" onClick={this.toggleSideMenuSmallBreakpoint} key="hamburger">
        <i className="fa fa-bars" />
        <span className="sidemenu__close">
          <i className="fa fa-times" />&nbsp;Close
        </span>
      </div>,
    ];
  }
}
