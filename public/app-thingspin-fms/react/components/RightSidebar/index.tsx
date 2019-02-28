import React, { PureComponent } from 'react';
import { TsRightSideTabComponent } from './RightSideTab/index';
import { TsRightSideTabbarComponent } from './RightSideTabbar/index';
import { TsRightSideHistoryComponent } from './RightSideHistory/index';

export class TsRightSidebar extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <TsRightSideTabComponent />
        <TsRightSideTabbarComponent />
        <TsRightSideHistoryComponent />
      </div>
    );
  }
}
