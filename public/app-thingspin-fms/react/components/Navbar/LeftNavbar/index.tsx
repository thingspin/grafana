import React, { PureComponent } from 'react';
import { TsIconLogo } from './IconLogo';
import { TsNavTitle } from './NavTitle';

export class TsLeftNavbar extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="ts-left-navbar">
        <TsIconLogo />
        <TsNavTitle />
      </div>
    );
  }
}
