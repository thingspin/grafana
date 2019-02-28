import React, { PureComponent } from 'react';
import { TsLeftNavbar } from './LeftNavbar';
import { TsRightNavbar } from './RightNavbar';

export class TsNavbar extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return [<TsLeftNavbar key="leftnavbar" />, <TsRightNavbar key="rightnavbar" />];
  }
}
