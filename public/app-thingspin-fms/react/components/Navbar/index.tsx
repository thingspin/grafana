import React, { PureComponent } from 'react';
import { TsLeftNavbar } from './LeftNavbar/index';
import { TsRightNavbar } from './RightNavbar/index';

export class TsNavbar extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return [<TsLeftNavbar key="leftnavbar" />, <TsRightNavbar key="rightnavbar" />];
  }
}
